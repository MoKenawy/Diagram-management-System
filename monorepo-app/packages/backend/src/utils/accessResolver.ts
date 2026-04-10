import { PrismaClient, TargetType, AccessPolicy, AccessLevel, Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

// ─────────────────────────────────────────────────────────────────────────────
// All distinct levels — no hierarchy, no inheritance
// ─────────────────────────────────────────────────────────────────────────────
export const ALL_ACCESS_LEVELS = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'ADMIN'] as const satisfies AccessLevel[];

// ─────────────────────────────────────────────────────────────────────────────
// Core single-diagram, single-action check
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deny-override resolution for exactly one diagram + one action.
 *
 * Evaluation order:
 *   1. ANY DENY rule for this exact level, for user or dept → false
 *   2. ANY ALLOW rule for this exact level, for user or dept → true
 *   3. Default → false
 */
export async function canAccessDiagram(
  prisma: PrismaClient,
  userId: string,
  departmentId: string | null,
  diagramId: string,
  requiredLevel: AccessLevel
): Promise<boolean> {
  const targetConditions = buildTargetConditions(userId, departmentId);

  // Step 1: exact-level DENY
  const denyRule = await prisma.diagramAccess.findFirst({
    where: {
      diagramId,
      policy: 'DENY',
      accessLevel: requiredLevel,       // exact match, no hierarchy
      OR: targetConditions,
    },
    select: { id: true },
  });

  if (denyRule) return false;

  // Step 2: exact-level ALLOW
  const allowRule = await prisma.diagramAccess.findFirst({
    where: {
      diagramId,
      policy: 'ALLOW',
      accessLevel: requiredLevel,       // exact match, no hierarchy
      OR: targetConditions,
    },
    select: { id: true },
  });

  return !!allowRule;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bulk accessible-diagram resolver — avoids N+1
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns every diagramId the user has an explicit ALLOW (and no DENY)
 * for the given action.
 */
export async function getAccessibleDiagramIds(
  prisma: PrismaClient,
  userId: string,
  departmentId: string | null,
  requiredLevel: AccessLevel
): Promise<string[]> {
  if (departmentId) {
    const rows = await prisma.$queryRaw<Array<{ diagramId: string }>>`
      SELECT DISTINCT a."diagramId"
      FROM "DiagramAccess" a
      WHERE a."policy"      = 'ALLOW'::"AccessPolicy"
        AND a."accessLevel" = ${requiredLevel}::"AccessLevel"
        AND (
          (a."targetType" = 'USER'::"TargetType"       AND a."targetId" = ${userId})
          OR
          (a."targetType" = 'DEPARTMENT'::"TargetType" AND a."targetId" = ${departmentId})
        )
        AND NOT EXISTS (
          SELECT 1 FROM "DiagramAccess" d
          WHERE d."diagramId"   = a."diagramId"
            AND d."policy"      = 'DENY'::"AccessPolicy"
            AND d."accessLevel" = ${requiredLevel}::"AccessLevel"
            AND (
              (d."targetType" = 'USER'::"TargetType"       AND d."targetId" = ${userId})
              OR
              (d."targetType" = 'DEPARTMENT'::"TargetType" AND d."targetId" = ${departmentId})
            )
        )
    `;
    return rows.map((r) => r.diagramId);
  }

  const rows = await prisma.$queryRaw<Array<{ diagramId: string }>>`
    SELECT DISTINCT a."diagramId"
    FROM "DiagramAccess" a
    WHERE a."policy"      = 'ALLOW'::"AccessPolicy"
      AND a."accessLevel" = ${requiredLevel}::"AccessLevel"
      AND a."targetType"  = 'USER'::"TargetType"
      AND a."targetId"    = ${userId}
      AND NOT EXISTS (
        SELECT 1 FROM "DiagramAccess" d
        WHERE d."diagramId"   = a."diagramId"
          AND d."policy"      = 'DENY'::"AccessPolicy"
          AND d."accessLevel" = ${requiredLevel}::"AccessLevel"
          AND d."targetType"  = 'USER'::"TargetType"
          AND d."targetId"    = ${userId}
      )
  `;
  return rows.map((r) => r.diagramId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Full permission map — all actions in one round-trip
// ─────────────────────────────────────────────────────────────────────────────

export type PermissionMap = Record<AccessLevel, boolean>;

/**
 * Returns a flat map of every action → allowed for a given diagram.
 * Each action is evaluated independently with deny-override semantics.
 *
 * e.g. { VIEW: true, CREATE: true, UPDATE: false, DELETE: false, ADMIN: false }
 *
 * Designed for frontend use: one call, render/hide buttons accordingly.
 */
export async function getDiagramPermissions(
  prisma: PrismaClient,
  userId: string,
  departmentId: string | null,
  diagramId: string
): Promise<PermissionMap> {
  const targetConditions = buildTargetConditions(userId, departmentId);

  // Single query — fetch all rules for this diagram + targets
  const rules = await prisma.diagramAccess.findMany({
    where: {
      diagramId,
      OR: targetConditions,
    },
    select: { accessLevel: true, policy: true },
  });

  // Bucket into denied/allowed per level
  const denied  = new Set<AccessLevel>();
  const allowed = new Set<AccessLevel>();

  for (const rule of rules) {
    if (rule.policy === 'DENY')  denied.add(rule.accessLevel);
    if (rule.policy === 'ALLOW') allowed.add(rule.accessLevel);
  }

  // Each level resolved independently — deny wins, no inheritance
  return Object.fromEntries(
    ALL_ACCESS_LEVELS.map((level) => [
      level,
      !denied.has(level) && allowed.has(level),
    ])
  ) as PermissionMap;
}

// ─────────────────────────────────────────────────────────────────────────────
// Check multiple actions at once (e.g. can user UPDATE and DELETE?)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a subset PermissionMap for only the requested levels.
 * Useful when a single route needs to verify more than one action.
 *
 * @example
 *   const perms = await checkMultipleActions(prisma, userId, deptId, diagramId, ['UPDATE', 'ADMIN']);
 *   if (!perms.UPDATE || !perms.ADMIN) → 403
 */
export async function checkMultipleActions(
  prisma: PrismaClient,
  userId: string,
  departmentId: string | null,
  diagramId: string,
  requiredLevels: AccessLevel[]
): Promise<Partial<PermissionMap>> {
  const targetConditions = buildTargetConditions(userId, departmentId);

  const rules = await prisma.diagramAccess.findMany({
    where: {
      diagramId,
      accessLevel: { in: requiredLevels },
      OR: targetConditions,
    },
    select: { accessLevel: true, policy: true },
  });

  const denied  = new Set<AccessLevel>();
  const allowed = new Set<AccessLevel>();

  for (const rule of rules) {
    if (rule.policy === 'DENY')  denied.add(rule.accessLevel);
    if (rule.policy === 'ALLOW') allowed.add(rule.accessLevel);
  }

  return Object.fromEntries(
    requiredLevels.map((level) => [
      level,
      !denied.has(level) && allowed.has(level),
    ])
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Express middleware
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Single-action middleware. Protects a route with one required AccessLevel.
 *
 * @example
 *   router.get('/:id',       checkDiagramAccess('VIEW'))
 *   router.post('/:id',      checkDiagramAccess('CREATE'))
 *   router.put('/:id',       checkDiagramAccess('UPDATE'))
 *   router.delete('/:id',    checkDiagramAccess('DELETE'))
 *   router.post('/:id/share',checkDiagramAccess('ADMIN'))
 */
export function checkDiagramAccess(
  requiredLevel: AccessLevel,
  paramName: string = 'id'
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
        return;
      }

      const bypassRoles: Role[] = ['DC', 'ADMIN'];
      if (bypassRoles.includes(req.user.role)) {
        next();
        return;
      }

      const diagramId = Array.isArray(req.params[paramName])
        ? req.params[paramName][0]
        : req.params[paramName];

      if (!diagramId) {
        res.status(400).json({ error: 'BAD_REQUEST', message: `Missing route parameter: ${paramName}` });
        return;
      }

      const allowed = await canAccessDiagram(prisma, req.user.id, req.user.departmentId, diagramId, requiredLevel);

      if (!allowed) {
        res.status(403).json({
          error: 'FORBIDDEN',
          message: `This action requires '${requiredLevel}' permission on this diagram`,
        });
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Multi-action middleware. All listed levels must pass for the request to proceed.
 *
 * @example
 *   // User must have both UPDATE and ADMIN to change access rules
 *   router.put('/:id/access', checkDiagramAccessAll(['UPDATE', 'ADMIN']))
 */
export function checkDiagramAccessAll(
  requiredLevels: AccessLevel[],
  paramName: string = 'id'
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
        return;
      }

      const bypassRoles: Role[] = ['DC', 'ADMIN'];
      if (bypassRoles.includes(req.user.role)) {
        next();
        return;
      }

      const diagramId = Array.isArray(req.params[paramName])
        ? req.params[paramName][0]
        : req.params[paramName];

      if (!diagramId) {
        res.status(400).json({ error: 'BAD_REQUEST', message: `Missing route parameter: ${paramName}` });
        return;
      }

      const perms = await checkMultipleActions(prisma, req.user.id, req.user.departmentId, diagramId, requiredLevels);
      const denied = requiredLevels.filter((lvl) => !perms[lvl]);

      if (denied.length > 0) {
        res.status(403).json({
          error: 'FORBIDDEN',
          message: `Missing required permissions: ${denied.join(', ')}`,
        });
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildTargetConditions(userId: string, departmentId: string | null) {
  const conditions: Array<{ targetType: TargetType; targetId: string }> = [
    { targetType: 'USER', targetId: userId },
  ];
  if (departmentId) {
    conditions.push({ targetType: 'DEPARTMENT', targetId: departmentId });
  }
  return conditions;
}