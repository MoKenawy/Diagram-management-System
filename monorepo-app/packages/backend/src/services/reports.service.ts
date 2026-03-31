// src/services/reports.service.ts
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export interface DateRange {
  from?: string;
  to?: string;
}

function buildDateFilter(range: DateRange, field: string = 'occurredAt') {
  const filter: any = {};
  if (range.from) filter.gte = new Date(range.from);
  if (range.to) filter.lte = new Date(range.to);
  return Object.keys(filter).length > 0 ? { [field]: filter } : {};
}

export async function getSummary(range: DateRange) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const dateFilter = buildDateFilter(range, 'uploadedAt');

  const [
    totalActiveDiagrams,
    totalVersions,
    uploadsThisMonth,
    downloadsThisMonth,
    activeUsersThisMonth,
    storageResult,
  ] = await Promise.all([
    prisma.diagram.count({ where: { isActive: true } }),
    prisma.diagramVersion.count(),
    prisma.diagramVersion.count({
      where: {
        uploadedAt: { gte: startOfMonth },
      },
    }),
    prisma.auditLog.count({
      where: {
        action: 'DIAGRAM_DOWNLOADED',
        occurredAt: { gte: startOfMonth },
      },
    }),
    prisma.auditLog.findMany({
      where: {
        occurredAt: { gte: startOfMonth },
        userId: { not: null },
      },
      select: { userId: true },
      distinct: ['userId'],
    }),
    prisma.diagramVersion.aggregate({
      _sum: { fileSizeBytes: true },
    }),
  ]);

  return {
    totalActiveDiagrams,
    totalVersions,
    uploadsThisMonth,
    downloadsThisMonth,
    activeUsersThisMonth: activeUsersThisMonth.length,
    storageUsedBytes: storageResult._sum.fileSizeBytes?.toString() || '0',
  };
}

export async function getUploadsOverTime(
  range: DateRange,
  granularity: 'day' | 'week' | 'month'
) {
  let truncExpr: string;

  switch (granularity) {
    case 'day':
      truncExpr = `date_trunc('day', "uploadedAt")`;
      break;
    case 'week':
      truncExpr = `date_trunc('week', "uploadedAt")`;
      break;
    case 'month':
    default:
      truncExpr = `date_trunc('month', "uploadedAt")`;
      break;
  }

  let whereClause = 'WHERE 1=1';
  const params: any[] = [];

  if (range.from) {
    params.push(new Date(range.from));
    whereClause += ` AND "uploadedAt" >= $${params.length}`;
  }
  if (range.to) {
    params.push(new Date(range.to));
    whereClause += ` AND "uploadedAt" <= $${params.length}`;
  }

  const result = await prisma.$queryRawUnsafe<Array<{ period: Date; count: bigint }>>(
    `SELECT ${truncExpr} as period, COUNT(*)::bigint as count
     FROM "DiagramVersion"
     ${whereClause}
     GROUP BY period
     ORDER BY period ASC`,
    ...params
  );

  return result.map((row) => ({
    period: row.period.toISOString(),
    count: Number(row.count),
  }));
}

export async function getDownloadsByDiagram(range: DateRange) {
  let whereClause = `WHERE a."action" = 'DIAGRAM_DOWNLOADED' AND a."targetType" = 'DIAGRAM'`;
  const params: any[] = [];

  if (range.from) {
    params.push(new Date(range.from));
    whereClause += ` AND a."occurredAt" >= $${params.length}`;
  }
  if (range.to) {
    params.push(new Date(range.to));
    whereClause += ` AND a."occurredAt" <= $${params.length}`;
  }

  const result = await prisma.$queryRawUnsafe<
    Array<{ targetId: string; title: string; downloadCount: bigint }>
  >(
    `SELECT a."targetId", d."title", COUNT(*)::bigint as "downloadCount"
     FROM "AuditLog" a
     LEFT JOIN "Diagram" d ON d."id" = a."targetId"
     ${whereClause}
     GROUP BY a."targetId", d."title"
     ORDER BY "downloadCount" DESC
     LIMIT 20`,
    ...params
  );

  return result.map((row) => ({
    diagramId: row.targetId,
    title: row.title || 'Unknown',
    downloadCount: Number(row.downloadCount),
  }));
}

export async function getAccessByDepartment(range: DateRange) {
  let downloadWhereClause = `WHERE a."action" = 'DIAGRAM_DOWNLOADED' AND a."targetType" = 'DIAGRAM'`;
  const params: any[] = [];

  if (range.from) {
    params.push(new Date(range.from));
    downloadWhereClause += ` AND a."occurredAt" >= $${params.length}`;
  }
  if (range.to) {
    params.push(new Date(range.to));
    downloadWhereClause += ` AND a."occurredAt" <= $${params.length}`;
  }

  const result = await prisma.$queryRawUnsafe<
    Array<{
      departmentId: string;
      nameAr: string;
      nameEn: string;
      diagramCount: bigint;
      downloadCount: bigint;
    }>
  >(
    `SELECT
       dep."id" as "departmentId",
       dep."nameAr",
       dep."nameEn",
       COUNT(DISTINCT d."id")::bigint as "diagramCount",
       COALESCE(dl."downloadCount", 0)::bigint as "downloadCount"
     FROM "Department" dep
     LEFT JOIN "Diagram" d ON d."departmentId" = dep."id" AND d."isActive" = true
     LEFT JOIN (
       SELECT a."targetId", COUNT(*)::bigint as "downloadCount"
       FROM "AuditLog" a
       ${downloadWhereClause}
       GROUP BY a."targetId"
     ) dl ON dl."targetId" = d."id"
     GROUP BY dep."id", dep."nameAr", dep."nameEn", dl."downloadCount"
     ORDER BY "diagramCount" DESC`,
    ...params
  );

  return result.map((row) => ({
    departmentId: row.departmentId,
    nameAr: row.nameAr,
    nameEn: row.nameEn,
    diagramCount: Number(row.diagramCount),
    downloadCount: Number(row.downloadCount),
  }));
}