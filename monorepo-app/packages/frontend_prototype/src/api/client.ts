// src/api/client.ts
import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { useAuthStore } from '../store/authStore';
import type {
  AuditLogPaginatedResponse,
  BackupRecord,
  DepartmentAccessStats,
  DiagramPaginatedResponse,
  ReplicationTarget,
  ReportSummary,
  TimeSeriesPoint,
} from '../types';



interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor: attach Authorization header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 → refresh → retry once
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // If no config or already retried, reject
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken } = useAuthStore.getState();
      const newToken = await refreshToken();

      if (newToken) {
        // Update the header and retry
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }

      // refreshToken() already called logout() if it failed
      return Promise.reject(error);
    }

    // If 401 on retry (second 401), logout
    if (error.response?.status === 401 && originalRequest._retry) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);




// ─── Diagrams ─────────────────────────────────────────────────
export async function fetchDiagrams(params: Record<string, string | number | undefined>) {
  const { data } = await apiClient.get<DiagramPaginatedResponse>('/diagrams', { params });
  return data;
}

// ─── Reports ──────────────────────────────────────────────────
export async function fetchReportSummary(params?: { from?: string; to?: string }) {
  const { data } = await apiClient.get<ReportSummary>('/reports/summary', { params });
  return data;
}

export async function fetchUploadsOverTime(params?: {
  from?: string;
  to?: string;
  granularity?: string;
}) {
  const { data } = await apiClient.get<TimeSeriesPoint[]>('/reports/uploads-over-time', { params });
  return data;
}

export async function fetchAccessByDepartment(params?: { from?: string; to?: string }) {
  const { data } = await apiClient.get<DepartmentAccessStats[]>('/reports/access-by-department', {
    params,
  });
  return data;
}

export function getExportUrl(format: 'excel' | 'pdf', from?: string, to?: string) {
  const params = new URLSearchParams({ format });
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  return `/api/reports/export?${params.toString()}`;
}

// ─── Admin ────────────────────────────────────────────────────
export async function fetchAuditLogs(params?: Record<string, string | number | undefined>) {
  const { data } = await apiClient.get<AuditLogPaginatedResponse>('/admin/audit-logs', { params });
  return data;
}

export async function fetchBackups() {
  const { data } = await apiClient.get<BackupRecord[]>('/admin/backups');
  return data;
}

export async function triggerBackup() {
  const { data } = await apiClient.post<{ backupRecordId: string }>('/admin/backups');
  return data;
}

export async function fetchReplicationTargets() {
  const { data } = await apiClient.get<ReplicationTarget[]>('/admin/replication');
  return data;
}




export default apiClient;