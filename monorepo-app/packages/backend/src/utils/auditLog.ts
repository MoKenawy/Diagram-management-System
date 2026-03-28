import { PrismaClient } from '@prisma/client';

interface AuditLogParams {
  userId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  ipAddress?: string;
  metadata?: any;
}

export const logAction = async (prisma: PrismaClient, params: AuditLogParams) => {
  return prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      ipAddress: params.ipAddress,
      metadata: params.metadata || {},
    },
  });
};