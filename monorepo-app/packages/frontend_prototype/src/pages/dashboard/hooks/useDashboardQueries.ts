// src/pages/dashboard/hooks/useDashboardQueries.ts
import { useQuery } from '@tanstack/react-query';
import {
  fetchRecentDiagrams,
  fetchReportSummary,
  fetchMonthlyUploads,
  fetchDownloadsByDepartment,
  fetchSystemHealth,
  fetchRecentAuditLogs,
} from '../../../api/dashboard';
import type { DateRange } from '../../../types/dashboard';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const ADMIN_REFETCH_INTERVAL = 30 * 1000; // 30 seconds

export function useRecentDiagrams(daysAgo: number = 7) {
  return useQuery({
    queryKey: ['diagrams', 'recent', daysAgo],
    queryFn: () => fetchRecentDiagrams(daysAgo),
    staleTime: STALE_TIME,
  });
}

export function useReportSummary(dateRange?: DateRange) {
  const from = dateRange?.from.toISOString();
  const to = dateRange?.to.toISOString();

  return useQuery({
    queryKey: ['reports', 'summary', from, to],
    queryFn: () => fetchReportSummary(from, to),
    staleTime: STALE_TIME,
  });
}

export function useMonthlyUploads(dateRange?: DateRange) {
  const from = dateRange?.from.toISOString();
  const to = dateRange?.to.toISOString();

  return useQuery({
    queryKey: ['reports', 'uploads-by-month', from, to],
    queryFn: () => fetchMonthlyUploads(6, from, to),
    staleTime: STALE_TIME,
  });
}

export function useDownloadsByDepartment(dateRange?: DateRange) {
  const from = dateRange?.from.toISOString();
  const to = dateRange?.to.toISOString();

  return useQuery({
    queryKey: ['reports', 'downloads-by-department', from, to],
    queryFn: () => fetchDownloadsByDepartment(from, to),
    staleTime: STALE_TIME,
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ['admin', 'health'],
    queryFn: fetchSystemHealth,
    refetchInterval: ADMIN_REFETCH_INTERVAL,
    staleTime: 10 * 1000,
  });
}

export function useRecentAuditLogs(limit: number = 10) {
  return useQuery({
    queryKey: ['admin', 'audit', 'recent', limit],
    queryFn: () => fetchRecentAuditLogs(limit),
    refetchInterval: ADMIN_REFETCH_INTERVAL,
    staleTime: 10 * 1000,
  });
}