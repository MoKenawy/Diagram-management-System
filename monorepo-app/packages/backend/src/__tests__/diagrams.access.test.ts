// src/__tests__/diagrams.access.test.ts
import request from 'supertest';
import { testApp, testTokens } from './helpers/testApp';
import { prismaMock } from './helpers/mockPrisma';

jest.mock('../utils/auditLog', () => ({
  logAction: jest.fn(),
}));

describe('Diagrams Access API Integration Tests', () => {
  const diagramId = 'diagram-123';
  const roleId = 'rule-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /diagrams/:id/access', () => {
    it('returns 403 if user is not DC or ADMIN', async () => {
      const res = await request(testApp)
        .get(`/diagrams/${diagramId}/access`)
        .set('Cookie', [`refreshToken=dummy`]) // To pass authenticate? testApp might use Bearer or Cookie? Wait, authenticate middleware uses req.cookies or req.headers.authorization
        .set('Authorization', `Bearer ${testTokens.engineer()}`);

      expect(res.status).toBe(403);
    });

    it('returns 404 if diagram does not exist', async () => {
      prismaMock.diagram.findUnique.mockResolvedValue(null);

      const res = await request(testApp)
        .get(`/diagrams/${diagramId}/access`)
        .set('Authorization', `Bearer ${testTokens.dc()}`);

      expect(res.status).toBe(404);
    });

    it('returns 200 and a list of rules if successful (Admin/DC)', async () => {
      prismaMock.diagram.findUnique.mockResolvedValue({ id: diagramId } as any);
      prismaMock.diagramAccess.findMany.mockResolvedValue([{ id: 'rule-1' } as any]);

      const res = await request(testApp)
        .get(`/diagrams/${diagramId}/access`)
        .set('Authorization', `Bearer ${testTokens.admin()}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 'rule-1' }]);
    });
  });

  describe('POST /diagrams/:id/access', () => {
    const defaultPayload = {
      targetType: 'USER',
      targetId: 'user-456',
      accessLevel: 'VIEW',
      policy: 'ALLOW',
    };

    it('returns 404 if target user does not exist', async () => {
      prismaMock.diagram.findUnique.mockResolvedValue({ id: diagramId } as any);
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(testApp)
        .post(`/diagrams/${diagramId}/access`)
        .set('Authorization', `Bearer ${testTokens.dc()}`)
        .send(defaultPayload);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Target user or department does not exist');
    });

    it('returns 409 if a duplicate rule exists', async () => {
      prismaMock.diagram.findUnique.mockResolvedValue({ id: diagramId } as any);
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-456' } as any);
      prismaMock.diagramAccess.findFirst.mockResolvedValue({ id: 'existing-rule' } as any);

      const res = await request(testApp)
        .post(`/diagrams/${diagramId}/access`)
        .set('Authorization', `Bearer ${testTokens.dc()}`)
        .send(defaultPayload);

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('DUPLICATE_RULE');
    });

    it('returns 201 and creates the rule if successful', async () => {
      prismaMock.diagram.findUnique.mockResolvedValue({ id: diagramId } as any);
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-456' } as any);
      prismaMock.diagramAccess.findFirst.mockResolvedValue(null); // No duplicate
      const newRule = { ...defaultPayload, id: 'new-rule-123' };
      prismaMock.diagramAccess.create.mockResolvedValue(newRule as any);

      const res = await request(testApp)
        .post(`/diagrams/${diagramId}/access`)
        .set('Authorization', `Bearer ${testTokens.dc()}`)
        .send(defaultPayload);

      expect(res.status).toBe(201);
      expect(res.body.id).toBe('new-rule-123');
    });
  });

  describe('DELETE /diagrams/:id/access/:ruleId', () => {
    it('returns 404 if rule does not exist', async () => {
      prismaMock.diagram.findUnique.mockResolvedValue({ id: diagramId } as any);
      // Prisma delete will throw typically, but the service handles checking or error handling.
      // Wait, let's look at diagramExists and deleteAccessRule.
      // Assuming diagramsService.deleteAccessRule returns null when not found.
      const mockPrismaDelete = jest.spyOn(prismaMock.diagramAccess, 'delete');
      // to mock prisma failing with P2025 "Record to delete does not exist."
      mockPrismaDelete.mockRejectedValue({ code: 'P2025' });

      const res = await request(testApp)
        .delete(`/diagrams/${diagramId}/access/${roleId}`)
        .set('Authorization', `Bearer ${testTokens.admin()}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Access rule not found');
    });

    it('returns 200 on successful deletion', async () => {
      prismaMock.diagram.findUnique.mockResolvedValue({ id: diagramId } as any);
      const mockPrismaDelete = jest.spyOn(prismaMock.diagramAccess, 'delete');
      mockPrismaDelete.mockResolvedValue({ id: roleId, targetType: 'USER', targetId: '1', policy: 'ALLOW' } as any);

      const res = await request(testApp)
        .delete(`/diagrams/${diagramId}/access/${roleId}`)
        .set('Authorization', `Bearer ${testTokens.admin()}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Access rule removed');
      expect(res.body.ruleId).toBe(roleId);
    });
  });
});
