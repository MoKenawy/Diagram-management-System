// src/services/admin.service.ts
import { prisma } from '../lib/prisma';
import { Prisma, PrismaClient } from '@prisma/client';
import { AuditLogsQueryInput } from '../schemas/admin.schema';

type TransactionClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

// ─── System Config ───────────────────────────────────────────────

export async function getConfig(): Promise<Record<string, string>> {
  const configs = await prisma.systemConfig.findMany();
  const map: Record<string, string> = {};
  for (const c of configs) {
    map[c.key] = c.value;
  }
  return map;
}

export async function upsertConfig(data: Record<string, string>, updatedById: string) {
  const operations = Object.entries(data).map(([key, value]) =>
    prisma.systemConfig.upsert({
      where: { key },
      update: { value, updatedById },
      create: { key, value, updatedById },
    })
  );

  await prisma.$transaction(operations);
}

// ─── Audit Logs ──────────────────────────────────────────────────

export async function getAuditLogs(query: AuditLogsQueryInput) {
  const { page, limit, userId, action, from, to } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.AuditLogWhereInput = {};

  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (from || to) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    where.occurredAt = dateFilter;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { occurredAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Backups ─────────────────────────────────────────────────────

export async function getBackups() {
  return prisma.backupRecord.findMany({
    include: {
      triggeredBy: {
        select: {
          id: true,
          username: true,
          fullName: true,
        },
      },
    },
    orderBy: { startedAt: 'desc' },
  });
}

export async function createBackupRecord(triggeredById: string) {
  return prisma.backupRecord.create({
    data: {
      filePath: '',
      sizeBytes: BigInt(0),
      status: 'RUNNING',
      triggeredById,
    },
  });
}

export async function getBackupById(id: string) {
  return prisma.backupRecord.findUnique({ where: { id } });
}

// ─── Replication ─────────────────────────────────────────────────

export async function getReplicationTargets() {
  return prisma.replicationTarget.findMany({
    select: {
      id: true,
      host: true,
      port: true,
      label: true,
      sshUsername: true,
      isActive: true,
      lastSyncAt: true,
      lastSyncStatus: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createReplicationTarget(data: {
  host: string;
  port: number;
  label: string;
  sshUsername: string;
  sshKeyPath: string;
}) {
  const createData: Prisma.ReplicationTargetCreateInput = {
    host: data.host,
    port: data.port,
    label: data.label,
    sshUsername: data.sshUsername,
    sshKeyPath: data.sshKeyPath,
  };

  return prisma.replicationTarget.create({ data: createData });
}

export async function updateReplicationTarget(
  id: string,
  data: Partial<{
    host: string;
    port: number;
    label: string;
    sshUsername: string;
    sshKeyPath: string;
    isActive: boolean;
  }>
) {
  const updateData: Prisma.ReplicationTargetUpdateInput = {};

  if (data.host !== undefined) updateData.host = data.host;
  if (data.port !== undefined) updateData.port = data.port;
  if (data.label !== undefined) updateData.label = data.label;
  if (data.sshUsername !== undefined) updateData.sshUsername = data.sshUsername;
  if (data.sshKeyPath !== undefined) updateData.sshKeyPath = data.sshKeyPath;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return prisma.replicationTarget.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteReplicationTarget(id: string) {
  return prisma.replicationTarget.delete({ where: { id } });
}

export async function getReplicationTargetById(id: string) {
  return prisma.replicationTarget.findUnique({ where: { id } });
}