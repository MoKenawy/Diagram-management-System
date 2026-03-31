// src/__tests__/accessResolver.test.ts
import { PrismaClient } from '@prisma/client';
import { canAccessDiagram } from '../utils/accessResolver';

// ─── Mock Setup ──────────────────────────────────────────────────
// We mock PrismaClient to avoid needing a real database in unit tests.
// Each test configures findFirst to return what the resolver should see.

interface MockRule {
  id: string;
  diagramId: string;
  targetType: 'USER' | 'DEPARTMENT';
  targetId: string;
  policy: 'ALLOW' | 'DENY';
  accessLevel: 'VIEW' | 'EDIT' | 'ADMIN';
  grantedAt: Date;
  grantedById: string;
}

function buildMockPrisma(rules: MockRule[]): PrismaClient {
  // canAccessDiagram calls prisma.diagramAccess.findFirst twice
  // (once for DENY, once for ALLOW).  We intercept the WHERE clause
  // and evaluate against our in-memory rules.

  const findFirst = jest.fn().mockImplementation(async (args: any) => {
    const where = args?.where;
    if (!where) return null;

    const diagramId: string = where.diagramId;
    const orClauses: Array<{
      targetType: string;
      targetId: string;
      policy: string;
    }> = where.OR || [];

    for (const rule of rules) {
      if (rule.diagramId !== diagramId) continue;

      const matches = orClauses.some(
        (clause) =>
          clause.targetType === rule.targetType &&
          clause.targetId === rule.targetId &&
          clause.policy === rule.policy
      );

      if (matches) {
        return { id: rule.id };
      }
    }

    return null;
  });

  return {
    diagramAccess: { findFirst },
  } as unknown as PrismaClient;
}

// ─── Helpers ─────────────────────────────────────────────────────
const DIAGRAM = 'diagram-001';
const USER_A = 'user-a';
const DEPT_X = 'dept-x';

function makeRule(
  overrides: Partial<MockRule> & Pick<MockRule, 'targetType' | 'targetId' | 'policy'>
): MockRule {
  return {
    id: `rule-${Math.random().toString(36).slice(2, 8)}`,
    diagramId: DIAGRAM,
    accessLevel: 'VIEW',
    grantedAt: new Date(),
    grantedById: 'admin',
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────

describe('canAccessDiagram', () => {
  it('returns false when no rules exist (default deny)', async () => {
    const prisma = buildMockPrisma([]);
    const result = await canAccessDiagram(prisma, USER_A, DEPT_X, DIAGRAM);
    expect(result).toBe(false);
  });

  it('returns true when an ALLOW rule exists and no DENY rule', async () => {
    const rules: MockRule[] = [
      makeRule({ targetType: 'USER', targetId: USER_A, policy: 'ALLOW' }),
    ];
    const prisma = buildMockPrisma(rules);
    const result = await canAccessDiagram(prisma, USER_A, DEPT_X, DIAGRAM);
    expect(result).toBe(true);
  });

  it('returns true when a department-level ALLOW exists and no DENY', async () => {
    const rules: MockRule[] = [
      makeRule({ targetType: 'DEPARTMENT', targetId: DEPT_X, policy: 'ALLOW' }),
    ];
    const prisma = buildMockPrisma(rules);
    const result = await canAccessDiagram(prisma, USER_A, DEPT_X, DIAGRAM);
    expect(result).toBe(true);
  });

  it('User-level DENY overrides department-level ALLOW', async () => {
    const rules: MockRule[] = [
      makeRule({ targetType: 'DEPARTMENT', targetId: DEPT_X, policy: 'ALLOW' }),
      makeRule({ targetType: 'USER', targetId: USER_A, policy: 'DENY' }),
    ];
    const prisma = buildMockPrisma(rules);
    const result = await canAccessDiagram(prisma, USER_A, DEPT_X, DIAGRAM);
    expect(result).toBe(false);
  });

  it('Department-level DENY overrides user-level ALLOW', async () => {
    const rules: MockRule[] = [
      makeRule({ targetType: 'USER', targetId: USER_A, policy: 'ALLOW' }),
      makeRule({ targetType: 'DEPARTMENT', targetId: DEPT_X, policy: 'DENY' }),
    ];
    const prisma = buildMockPrisma(rules);
    const result = await canAccessDiagram(prisma, USER_A, DEPT_X, DIAGRAM);
    expect(result).toBe(false);
  });

  it('User-level DENY overrides user-level ALLOW', async () => {
    const rules: MockRule[] = [
      makeRule({ targetType: 'USER', targetId: USER_A, policy: 'ALLOW' }),
      makeRule({ targetType: 'USER', targetId: USER_A, policy: 'DENY' }),
    ];
    const prisma = buildMockPrisma(rules);
    const result = await canAccessDiagram(prisma, USER_A, DEPT_X, DIAGRAM);
    expect(result).toBe(false);
  });

  it('Department-level DENY overrides department-level ALLOW', async () => {
    const rules: MockRule[] = [
      makeRule({ targetType: 'DEPARTMENT', targetId: DEPT_X, policy: 'ALLOW' }),
      makeRule({ targetType: 'DEPARTMENT', targetId: DEPT_X, policy: 'DENY' }),
    ];
    const prisma = buildMockPrisma(rules);
    const result = await canAccessDiagram(prisma, USER_A, DEPT_X, DIAGRAM);
    expect(result).toBe(false);
  });

  it('handles user with null departmentId correctly — ALLOW', async () => {
    const rules: MockRule[] = [
      makeRule({ targetType: 'USER', targetId: USER_A, policy: 'ALLOW' }),
    ];
    const prisma = buildMockPrisma(rules);
    const result = await canAccessDiagram(prisma, USER_A, null, DIAGRAM);
    expect(result).toBe(true);
  });

  it('handles user with null departmentId correctly — default deny', async () => {
    // Only a department-level ALLOW exists, but user has no department
    const rules: MockRule[] = [
      makeRule({ targetType: 'DEPARTMENT', targetId: DEPT_X, policy: 'ALLOW' }),
    ];
    const prisma = buildMockPrisma(rules);
    const result = await canAccessDiagram(prisma, USER_A, null, DIAGRAM);
    expect(result).toBe(false);
  });

  it('rules for a different diagram do not affect resolution', async () => {
    const rules: MockRule[] = [
      makeRule({
        diagramId: 'diagram-999',
        targetType: 'USER',
        targetId: USER_A,
        policy: 'ALLOW',
      }),
    ];
    const prisma = buildMockPrisma(rules);
    const result = await canAccessDiagram(prisma, USER_A, DEPT_X, DIAGRAM);
    expect(result).toBe(false);
  });

  it('rules for a different user do not grant access', async () => {
    const rules: MockRule[] = [
      makeRule({ targetType: 'USER', targetId: 'user-b', policy: 'ALLOW' }),
    ];
    const prisma = buildMockPrisma(rules);
    const result = await canAccessDiagram(prisma, USER_A, DEPT_X, DIAGRAM);
    expect(result).toBe(false);
  });
});