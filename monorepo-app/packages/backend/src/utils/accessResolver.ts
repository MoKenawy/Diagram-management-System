import { PrismaClient, TargetType, AccessPolicy, Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

export interface AuthUser {
  id: string;
  departmentId: string | null;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

/**
 * Evaluates if a user has access to a specific diagram using Deny-Override logic.
 */
export async function canAccessDiagram(
  prisma: PrismaClient,
  userId: string,
  departmentId: string | null,
  diagramId: string
): Promise<boolean> {
  // Explicitly type the array so it accepts both USER and DEPARTMENT
  const targetConditions: { targetType: TargetType; targetId: string }[] = [
    { targetType: TargetType.USER, targetId: userId },
  ];

  if (departmentId) {
    targetConditions.push({ targetType: TargetType.DEPARTMENT, targetId: departmentId });
  }

  // 1. Check for any DENY rules (Deny wins immediately)
  const denyRule = await prisma.diagramAccess.findFirst({
    where: {
      diagramId,
      policy: AccessPolicy.DENY,
      OR: targetConditions,
    },
  });

  if (denyRule) {
    return false;
  }

  // 2. Check for any ALLOW rules
  const allowRule = await prisma.diagramAccess.findFirst({
    where: {
      diagramId,
      policy: AccessPolicy.ALLOW,
      OR: targetConditions,
    },
  });

  if (allowRule) {
    return true;
  }

  // 3. Default deny - no matching rule
  return false;
}

/**
 * Returns IDs of all diagrams the user can access.
 * Useful for list/archive queries.
 */
export async function getAccessibleDiagramIds(
  prisma: PrismaClient,
  userId: string,
  departmentId: string | null
): Promise<string[]> {
  // Explicitly type the array so it accepts both USER and DEPARTMENT
  const targetConditions: { targetType: TargetType; targetId: string }[] = [
    { targetType: TargetType.USER, targetId: userId },
  ];

  if (departmentId) {
    targetConditions.push({ targetType: TargetType.DEPARTMENT, targetId: departmentId });
  }

  // Fetch all access rules relevant to this user/department
  const accessRules = await prisma.diagramAccess.findMany({
    where: {
      OR: targetConditions,
    },
    select: {
      diagramId: true,
      policy: true,
    },
  });

  const allowSet = new Set<string>();
  const denySet = new Set<string>();

  // Process rules
  for (const rule of accessRules) {
    if (rule.policy === AccessPolicy.DENY) {
      denySet.add(rule.diagramId);
    } else if (rule.policy === AccessPolicy.ALLOW) {
      allowSet.add(rule.diagramId);
    }
  }

  // Subtract DENY targets from ALLOW targets
  return Array.from(allowSet).filter((id) => !denySet.has(id));
}

/**
 * Express middleware factory to check diagram access.
 */
export function checkDiagramAccess(prisma: PrismaClient, paramName: string = 'id') {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      
      if (!user) {
        res.status(401).json({ error: 'Unauthorized: User context missing' });
        return;
      }

      // ADMIN and DC bypass the access check entirely
      if (user.role === Role.ADMIN || user.role === Role.DC) {
        return next();
      }

      const rawDiagramId = req.params[paramName];
      
      // Handle missing or array-based parameter types cleanly for TypeScript
      if (!rawDiagramId || typeof rawDiagramId !== 'string') {
        res.status(400).json({ error: 'Bad Request: Valid Diagram ID is required' });
        return;
      }

      const hasAccess = await canAccessDiagram(prisma, user.id, user.departmentId, rawDiagramId);

      if (!hasAccess) {
        res.status(403).json({ error: 'Forbidden: You do not have access to this diagram' });
        return;
      }

      next();
    } catch (error) {
      console.error('Access Resolution Error:', error);
      res.status(500).json({ error: 'Internal Server Error during access resolution' });
    }
  };
}