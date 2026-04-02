// src/services/api/reportService.ts
import { api } from '@/services/api/authService';
import type {
  ReportSummaryResponse,
  ReportDateParams,
  UploadsOverTimeParams,
  TimeSeriesPoint,
  DiagramDownloadCount,
  DepartmentAccessStats,
  ReportExportParams,
} from '@/types/index';

export const getReportSummary = async (
  params?: ReportDateParams
): Promise<ReportSummaryResponse> => {
  const response = await api.get<ReportSummaryResponse>('/api/reports/summary', { params });
  return response.data;
};

export const getUploadsOverTime = async (
  params?: UploadsOverTimeParams
): Promise<TimeSeriesPoint[]> => {
  const response = await api.get<TimeSeriesPoint[]>('/api/reports/uploads-over-time', { params });
  return response.data;
};

export const getDownloadsByDiagram = async (
  params?: ReportDateParams
): Promise<DiagramDownloadCount[]> => {
  const response = await api.get<DiagramDownloadCount[]>('/api/reports/downloads-by-diagram', {
    params,
  });
  return response.data;
};

export const getAccessByDepartment = async (
  params?: ReportDateParams
): Promise<DepartmentAccessStats[]> => {
  const response = await api.get<DepartmentAccessStats[]>('/api/reports/access-by-department', {
    params,
  });
  return response.data;
};

export const exportReport = async (params: ReportExportParams): Promise<Blob> => {
  const response = await api.get('/api/reports/export', {
    params,
    responseType: 'blob',
  });
  return response.data as Blob;
};