// src/utils/accessResolver.ts
import { PrismaClient, TargetType, AccessPolicy, Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
/**
 * Deny-Override access resolution for a single diagram.
 *
 * Evaluation order (strict):
 *   1. If ANY DENY rule matches the user or their department → false
 *   2. If ANY ALLOW rule matches the user or their department → true
 *   3. Default → false (no matching rule = deny)
 */
export async function canAccessDiagram(
  prisma: PrismaClient,
  userId: string,
  departmentId: string | null,
  diagramId: string
): Promise<boolean> {
  // ── Step 1: Check for any DENY rule ────────────────────────────
  const denyConditions: Array<{ targetType: TargetType; targetId: string; policy: AccessPolicy }> = [
    { targetType: 'USER', targetId: userId, policy: 'DENY' },
  ];

  if (departmentId) {
    denyConditions.push({
      targetType: 'DEPARTMENT',
      targetId: departmentId,
      policy: 'DENY',
    });
  }

  const denyRule = await prisma.diagramAccess.findFirst({
    where: {
      diagramId,
      OR: denyConditions,
    },
    select: { id: true },
  });

  if (denyRule) {
    return false;
  }

  // ── Step 2: Check for any ALLOW rule ───────────────────────────
  const allowConditions: Array<{ targetType: TargetType; targetId: string; policy: AccessPolicy }> = [
    { targetType: 'USER', targetId: userId, policy: 'ALLOW' },
  ];

  if (departmentId) {
    allowConditions.push({
      targetType: 'DEPARTMENT',
      targetId: departmentId,
      policy: 'ALLOW',
    });
  }

  const allowRule = await prisma.diagramAccess.findFirst({
    where: {
      diagramId,
      OR: allowConditions,
    },
    select: { id: true },
  });

  if (allowRule) {
    return true;
  }

  // ── Step 3: Default deny ───────────────────────────────────────
  return false;
}

/**
 * Returns the IDs of every diagram the user is permitted to view.
 *
 * Strategy – single raw SQL query:
 *   SELECT all diagramIds that have at least one ALLOW rule for the
 *   user/department AND no DENY rule for the user/department.
 *   This avoids N+1 calls to canAccessDiagram.
 */
export async function getAccessibleDiagramIds(
  prisma: PrismaClient,
  userId: string,
  departmentId: string | null
): Promise<string[]> {
  // Build the target-match clause fragments once
  // We need diagrams where:
  //   - There exists an ALLOW rule matching user or dept
  //   - There does NOT exist a DENY rule matching user or dept

  if (departmentId) {
    const rows = await prisma.$queryRaw<Array<{ diagramId: string }>>`
      SELECT DISTINCT a."diagramId"
      FROM "DiagramAccess" a
      WHERE a."policy" = 'ALLOW'::"AccessPolicy"
        AND (
          (a."targetType" = 'USER'::"TargetType"       AND a."targetId" = ${userId})
          OR
          (a."targetType" = 'DEPARTMENT'::"TargetType"  AND a."targetId" = ${departmentId})
        )
        AND NOT EXISTS (
          SELECT 1
          FROM "DiagramAccess" d
          WHERE d."diagramId" = a."diagramId"
            AND d."policy" = 'DENY'::"AccessPolicy"
            AND (
              (d."targetType" = 'USER'::"TargetType"       AND d."targetId" = ${userId})
              OR
              (d."targetType" = 'DEPARTMENT'::"TargetType"  AND d."targetId" = ${departmentId})
            )
        )
    `;
    return rows.map((r) => r.diagramId);
  }

  // User has no department – only match USER-level rules
  const rows = await prisma.$queryRaw<Array<{ diagramId: string }>>`
    SELECT DISTINCT a."diagramId"
    FROM "DiagramAccess" a
    WHERE a."policy" = 'ALLOW'::"AccessPolicy"
      AND a."targetType" = 'USER'::"TargetType"
      AND a."targetId" = ${userId}
      AND NOT EXISTS (
        SELECT 1
        FROM "DiagramAccess" d
        WHERE d."diagramId" = a."diagramId"
          AND d."policy" = 'DENY'::"AccessPolicy"
          AND d."targetType" = 'USER'::"TargetType"
          AND d."targetId" = ${userId}
      )
  `;
  return rows.map((r) => r.diagramId);
}

/**
 * Express middleware factory.
 *
 * DC and ADMIN roles bypass the check entirely (they see all diagrams).
 * For everyone else, canAccessDiagram is evaluated; 403 on denial.
 *
 * @param paramName  The name of the req.params key holding the diagram ID
 */
export function checkDiagramAccess(paramName: string = 'id') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
        return;
      }

      // DC and ADMIN bypass – they can see every diagram
      const bypassRoles: Role[] = ['DC', 'ADMIN'];
      if (bypassRoles.includes(req.user.role)) {
        next();
        return;
      }

      const diagramId = Array.isArray(req.params[paramName]) ? req.params[paramName][0] : req.params[paramName];
      if (!diagramId) {
        res.status(400).json({
          error: 'BAD_REQUEST',
          message: `Missing route parameter: ${paramName}`,
        });
        return;
      }

      // Lazy-import prisma to avoid circular deps

      const allowed = await canAccessDiagram(
        prisma,
        req.user.id,
        req.user.departmentId,
        diagramId
      );

      if (!allowed) {
        res.status(403).json({
          error: 'FORBIDDEN',
          message: 'You do not have access to this diagram',
        });
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}