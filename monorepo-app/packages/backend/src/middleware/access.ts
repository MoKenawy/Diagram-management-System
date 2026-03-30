import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';

/**
 * Returns diagram IDs accessible by an ENGINEER user.
 * Checks DiagramAccess rules for USER-level and DEPARTMENT-level ALLOW,
 * minus any DENY rules.
 */
export async function getAccessibleDiagramIds(
  userId: string,
  departmentId: string | null
): Promise<string[]> {
  // Get all ALLOW rules for this user (direct or via department)
  const allowConditions: any[] = [
    { targetType: 'USER', targetId: userId, policy: 'ALLOW' },
  ];

  if (departmentId) {
    allowConditions.push({
      targetType: 'DEPARTMENT',
      targetId: departmentId,
      policy: 'ALLOW',
    });
  }

  const allowRules = await prisma.diagramAccess.findMany({
    where: { OR: allowConditions },
    select: { diagramId: true },
  });

  const allowedIds = new Set(allowRules.map((r) => r.diagramId));

  // Get all DENY rules for this user
  const denyConditions: any[] = [
    { targetType: 'USER', targetId: userId, policy: 'DENY' },
  ];

  if (departmentId) {
    denyConditions.push({
      targetType: 'DEPARTMENT',
      targetId: departmentId,
      policy: 'DENY',
    });
  }

  const denyRules = await prisma.diagramAccess.findMany({
    where: { OR: denyConditions },
    select: { diagramId: true },
  });

  const deniedIds = new Set(denyRules.map((r) => r.diagramId));

  // Return allowed minus denied
  return Array.from(allowedIds).filter((id) => !deniedIds.has(id));
}

/**
 * Middleware: checks if the current user can access the diagram specified by :id.
 * DC, ADMIN, MANAGER can access any active diagram.
 * ENGINEER can only access diagrams they have been granted access to.
 */
export function checkDiagramAccess() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const diagramId = req.params.id;
      if (!diagramId) {
        res.status(400).json({ error: 'Diagram ID is required' });
        return;
      }
      if (typeof diagramId !== 'string' ) {
        res.status(400).json({ error: 'Invalid diagram ID format' });
        return;
      }

      // Check diagram exists and is active
      const diagram = await prisma.diagram.findUnique({
        where: { id: diagramId },
      });

      if (!diagram || !diagram.isActive) {
        res.status(404).json({ error: 'Diagram not found' });
        return;
      }

      // DC, ADMIN, MANAGER have full access
      if (['DC', 'ADMIN', 'MANAGER'].includes(user.role)) {
        (req as any).diagram = diagram;
        return next();
      }

      
      // ENGINEER: check access rules
      if (user.role === 'ENGINEER') {
        const accessibleIds = await getAccessibleDiagramIds(
          user.id,
          user.departmentId || null
        );

        if (accessibleIds.includes(diagramId)) {
          (req as any).diagram = diagram;
          return next();
        }

        // Also allow if the diagram belongs to the engineer's department
        // and there's no explicit DENY
        if (user.departmentId && diagram.departmentId === user.departmentId) {
          const denyRule = await prisma.diagramAccess.findFirst({
            where: {
              diagramId,
              OR: [
                { targetType: 'USER', targetId: user.id, policy: 'DENY' },
                {
                  targetType: 'DEPARTMENT',
                  targetId: user.departmentId,
                  policy: 'DENY',
                },
              ],
            },
          });

          if (!denyRule) {
            (req as any).diagram = diagram;
            return next();
          }
        }

        res.status(403).json({ error: 'Access denied to this diagram' });
        return;
      }

      res.status(403).json({ error: 'Access denied' });
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware: restrict to specific roles
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(user.role as Role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}