// src/services/audit.service.ts
import { prisma } from '../lib/prisma';

export interface LogActionParams {
  userId?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logAction(params: LogActionParams): Promise<void> {
  const { userId, action, targetType, targetId, ipAddress, metadata = {} } = params;

  await prisma.auditLog.create({
    data: {
      userId: userId ?? null,
      action,
      targetType: targetType ?? null,
      targetId: targetId ?? null,
      ipAddress: ipAddress ?? null,
      metadata: metadata as any,
    },
  });
}

export function getClientIp(req: { ip?: string; headers?: Record<string, string | string[] | undefined> }): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return first.trim();
  }
  return req.ip || 'unknown';
}