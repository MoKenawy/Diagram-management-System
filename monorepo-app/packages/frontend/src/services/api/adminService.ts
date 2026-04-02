// src/services/api/adminService.ts
import { api } from '@/services/api/authService';
import type {
  AuditLogPaginatedResponse,
  AuditLogListParams,
  BackupRecordResponse,
  BackupTriggerResponse,
  ReplicationTargetResponse,
  ConfigMap,
} from '@/types/index';

export const getAuditLogs = async (
  params?: AuditLogListParams
): Promise<AuditLogPaginatedResponse> => {
  const response = await api.get<AuditLogPaginatedResponse>('/api/admin/audit-logs', { params });
  return response.data;
};

export const getBackups = async (): Promise<BackupRecordResponse[]> => {
  const response = await api.get<BackupRecordResponse[]>('/api/admin/backups');
  return response.data;
};

export const triggerBackup = async (): Promise<BackupTriggerResponse> => {
  const response = await api.post<BackupTriggerResponse>('/api/admin/backups');
  return response.data;
};

export const getReplicationTargets = async (): Promise<ReplicationTargetResponse[]> => {
  const response = await api.get<ReplicationTargetResponse[]>('/api/admin/replication');
  return response.data;
};

export const getSystemConfig = async (): Promise<ConfigMap> => {
  const response = await api.get<ConfigMap>('/api/admin/config');
  return response.data;
};