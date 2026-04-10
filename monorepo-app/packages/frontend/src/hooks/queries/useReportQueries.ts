// src/hooks/queries/useReportQueries.ts
import { useQuery } from '@tanstack/react-query';
import {
  getReportSummary,
  getUploadsOverTime,
  getDownloadsByDiagram,
  getAccessByDepartment,
} from '@/api/services/reportService';
import type {
  ReportDateParams,
  UploadsOverTimeParams,
  TimeGranularity,
} from '@/types/index';

export const reportKeys = {
  all: ['reports'] as const,
  summary: (params?: ReportDateParams) => [...reportKeys.all, 'summary', params] as const,
  uploads: (params?: UploadsOverTimeParams) => [...reportKeys.all, 'uploads', params] as const,
  downloads: (params?: ReportDateParams) => [...reportKeys.all, 'downloads', params] as const,
  departments: (params?: ReportDateParams) => [...reportKeys.all, 'departments', params] as const,
};

export const useReportSummary = (params?: ReportDateParams) =>
  useQuery({
    queryKey: reportKeys.summary(params),
    queryFn: () => getReportSummary(params),
  });

export const useUploadsOverTime = (
  dateParams?: ReportDateParams,
  granularity: TimeGranularity = 'month' as TimeGranularity
) =>
  useQuery({
    queryKey: reportKeys.uploads({ ...dateParams, granularity }),
    queryFn: () => getUploadsOverTime({ ...dateParams, granularity }),
  });

export const useDownloadsByDiagram = (params?: ReportDateParams) =>
  useQuery({
    queryKey: reportKeys.downloads(params),
    queryFn: () => getDownloadsByDiagram(params),
  });

export const useAccessByDepartment = (params?: ReportDateParams) =>
  useQuery({
    queryKey: reportKeys.departments(params),
    queryFn: () => getAccessByDepartment(params),
  });