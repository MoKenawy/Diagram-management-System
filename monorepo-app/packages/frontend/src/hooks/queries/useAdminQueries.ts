// src/hooks/queries/useAdminQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAuditLogs,
  getBackups,
  triggerBackup,
  getReplicationTargets,
  getSystemConfig,
} from '@/services/api/adminService';
import type { AuditLogListParams } from '@/types/index';

export const adminKeys = {
  all: ['admin'] as const,
  auditLogs: (params?: AuditLogListParams) => [...adminKeys.all, 'audit-logs', params] as const,
  backups: () => [...adminKeys.all, 'backups'] as const,
  replication: () => [...adminKeys.all, 'replication'] as const,
  config: () => [...adminKeys.all, 'config'] as const,
};

export const useAuditLogs = (params?: AuditLogListParams) =>
  useQuery({
    queryKey: adminKeys.auditLogs(params),
    queryFn: () => getAuditLogs(params),
  });

export const useBackups = (refetchInterval?: number) =>
  useQuery({
    queryKey: adminKeys.backups(),
    queryFn: getBackups,
    refetchInterval,
  });

export const useReplicationTargets = (refetchInterval?: number) =>
  useQuery({
    queryKey: adminKeys.replication(),
    queryFn: getReplicationTargets,
    refetchInterval,
  });

export const useSystemConfig = () =>
  useQuery({
    queryKey: adminKeys.config(),
    queryFn: getSystemConfig,
  });

export const useTriggerBackup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.backups() });
    },
  });
};