// src/api/dashboard.ts
import apiClient from './client';
import type {
  DiagramSummary,
  ReportSummary,
  MonthlyUploadStat,
  DepartmentDownloadStat,
  SystemHealth,
  AuditLogEntry,
} from '../types/dashboard';

export async function fetchRecentDiagrams(daysAgo: number = 7): Promise<DiagramSummary[]> {
  const from = new Date();
  from.setDate(from.getDate() - daysAgo);

  const { data } = await apiClient.get<{ data: DiagramSummary[] }>('/diagrams', {
    params: {
      uploadedFrom: from.toISOString(),
      sort: 'uploadedAt',
      order: 'desc',
      limit: 20,
    },
  });

  return data.data;
}

export async function fetchReportSummary(
  from?: string,
  to?: string
): Promise<ReportSummary> {
  const { data } = await apiClient.get<ReportSummary>('/reports/summary', {
    params: { from, to },
  });

  return data;
}

export async function fetchMonthlyUploads(
  months: number = 6,
  from?: string,
  to?: string
): Promise<MonthlyUploadStat[]> {
  const { data } = await apiClient.get<{ data: MonthlyUploadStat[] }>(
    '/reports/uploads-by-month',
    { params: { months, from, to } }
  );

  return data.data;
}

export async function fetchDownloadsByDepartment(
  from?: string,
  to?: string
): Promise<DepartmentDownloadStat[]> {
  const { data } = await apiClient.get<{ data: DepartmentDownloadStat[] }>(
    '/reports/downloads-by-department',
    { params: { from, to } }
  );

  return data.data;
}

export async function fetchSystemHealth(): Promise<SystemHealth> {
  const { data } = await apiClient.get<SystemHealth>('/admin/health');
  return data;
}

export async function fetchRecentAuditLogs(
  limit: number = 10
): Promise<AuditLogEntry[]> {
  const { data } = await apiClient.get<{ data: AuditLogEntry[] }>('/audit', {
    params: { limit, sort: 'occurredAt', order: 'desc' },
  });

  return data.data;
}

export async function triggerBackup(): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>('/admin/backups');
  return data;
}

export function getExportUrl(format: 'excel' | 'pdf', from?: string, to?: string): string {
  const params = new URLSearchParams();
  params.set('format', format);
  if (from) params.set('from', from);
  if (to) params.set('to', to);

  return `/api/reports/export?${params.toString()}`;
}