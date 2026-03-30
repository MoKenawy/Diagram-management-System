import { prisma } from '../lib/prisma';


export async function logAction(params: {
  userId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        targetType: params.targetType || null,
        targetId: params.targetId || null,
        ipAddress: params.ipAddress || null,
        metadata: params.metadata || {},
      },
    });
  } catch (error) {
    console.error('Failed to log audit action:', error);
  }
}