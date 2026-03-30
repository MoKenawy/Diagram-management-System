import { canAccessDiagram } from '../accessResolver';
import { PrismaClient, TargetType, AccessPolicy } from '@prisma/client';

// Mocking the PrismaClient
const prismaMock = {
  diagramAccess: {
    findFirst: jest.fn(),
  },
} as unknown as PrismaClient;

describe('Access Resolution Engine - canAccessDiagram', () => {
  const userId = 'user-123';
  const departmentId = 'dept-456';
  const diagramId = 'diagram-789';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false if User-level Deny overrides Department-level Allow', async () => {
    // Mock setup: findFirst for DENY returns a user rule
    (prismaMock.diagramAccess.findFirst as jest.Mock).mockImplementation(async (args) => {
      if (args.where.policy === AccessPolicy.DENY) {
        return { id: 'rule-1', policy: AccessPolicy.DENY, targetType: TargetType.USER };
      }
      return null;
    });

    const result = await canAccessDiagram(prismaMock, userId, departmentId, diagramId);
    
    expect(result).toBe(false);
    expect(prismaMock.diagramAccess.findFirst).toHaveBeenCalledTimes(1); // Should exit early
  });

  it('should return false if Department-level Deny overrides User-level Allow', async () => {
    // Mock setup: findFirst for DENY returns a department rule
    (prismaMock.diagramAccess.findFirst as jest.Mock).mockImplementation(async (args) => {
      if (args.where.policy === AccessPolicy.DENY) {
        return { id: 'rule-2', policy: AccessPolicy.DENY, targetType: TargetType.DEPARTMENT };
      }
      return null;
    });

    const result = await canAccessDiagram(prismaMock, userId, departmentId, diagramId);
    
    expect(result).toBe(false);
    expect(prismaMock.diagramAccess.findFirst).toHaveBeenCalledTimes(1); // Should exit early
  });

  it('should return true for Allow without any Deny', async () => {
    (prismaMock.diagramAccess.findFirst as jest.Mock).mockImplementation(async (args) => {
      if (args.where.policy === AccessPolicy.DENY) {
        return null; // No deny rules
      }
      if (args.where.policy === AccessPolicy.ALLOW) {
        return { id: 'rule-3', policy: AccessPolicy.ALLOW, targetType: TargetType.USER }; // Found allow rule
      }
      return null;
    });

    const result = await canAccessDiagram(prismaMock, userId, departmentId, diagramId);
    
    expect(result).toBe(true);
    // Should check DENY first, then check ALLOW
    expect(prismaMock.diagramAccess.findFirst).toHaveBeenCalledTimes(2); 
  });

  it('should return false (default deny) if no rule exists', async () => {
    // Mock setup: No rules exist for either query
    (prismaMock.diagramAccess.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await canAccessDiagram(prismaMock, userId, departmentId, diagramId);
    
    expect(result).toBe(false);
    // Should check both DENY and ALLOW, finding neither
    expect(prismaMock.diagramAccess.findFirst).toHaveBeenCalledTimes(2);
  });
});