// src/__tests__/diagrams.service.test.ts
import { prismaMock } from './helpers/mockPrisma';
import { targetExists, checkDuplicateAccessRule } from '../services/diagrams.service';
import { TargetType, AccessPolicy, AccessLevel } from '@prisma/client';

describe('Diagrams Service', () => {
  describe('targetExists', () => {
    it('returns true when targetType is USER and user exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' } as any);
      
      const result = await targetExists('USER', 'user-1');
      
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { id: true }
      });
      expect(result).toBe(true);
    });

    it('returns false when targetType is USER and user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      
      const result = await targetExists('USER', 'user-1');
      
      expect(result).toBe(false);
    });

    it('returns true when targetType is DEPARTMENT and department exists', async () => {
      prismaMock.department.findUnique.mockResolvedValue({ id: 'dept-1' } as any);
      
      const result = await targetExists('DEPARTMENT', 'dept-1');
      
      expect(prismaMock.department.findUnique).toHaveBeenCalledWith({
        where: { id: 'dept-1' },
        select: { id: true }
      });
      expect(result).toBe(true);
    });

    it('returns false when targetType is DEPARTMENT and department does not exist', async () => {
      prismaMock.department.findUnique.mockResolvedValue(null);
      
      const result = await targetExists('DEPARTMENT', 'dept-1');
      
      expect(result).toBe(false);
    });

    it('returns false when targetType is invalid', async () => {
      const result = await targetExists('INVALID_TYPE', 'target-1');
      
      expect(result).toBe(false);
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.department.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('checkDuplicateAccessRule', () => {
    it('calls prisma.diagramAccess.findFirst with correct arguments and returns the rule', async () => {
      const expectedRule = { id: 'rule-1', diagramId: 'diagram-1', targetType: 'USER' as TargetType, targetId: 'user-1', policy: 'ALLOW' as AccessPolicy, accessLevel: 'VIEW' as AccessLevel, grantedAt: new Date(), grantedById: 'admin-1' };
      prismaMock.diagramAccess.findFirst.mockResolvedValue(expectedRule);
      
      const result = await checkDuplicateAccessRule(
        'diagram-1',
        'USER',
        'user-1',
        'ALLOW',
        'VIEW'
      );
      
      expect(prismaMock.diagramAccess.findFirst).toHaveBeenCalledWith({
        where: {
          diagramId: 'diagram-1',
          targetType: 'USER',
          targetId: 'user-1',
          policy: 'ALLOW',
          accessLevel: 'VIEW',
        }
      });
      expect(result).toEqual(expectedRule);
    });

    it('returns null if no duplicate rule is found', async () => {
      prismaMock.diagramAccess.findFirst.mockResolvedValue(null);
      
      const result = await checkDuplicateAccessRule(
        'diagram-1',
        'DEPARTMENT',
        'dept-1',
        'DENY',
        'EDIT'
      );
      
      expect(result).toBeNull();
    });
  });
});
