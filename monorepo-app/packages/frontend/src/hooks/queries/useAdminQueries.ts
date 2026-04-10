// src/hooks/queries/useAdminQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { privateApi as api } from '@/api/axiosClient';
import {
  getAuditLogs,
  getBackups,
  triggerBackup,
  getReplicationTargets,
  getSystemConfig,
  
} from '@/api/services/adminService';
import type { 
  AuditLogListParams, UserListParams, UserPaginatedResponse, 
  ConfigMap, RestoreResponse, MessageResponse,
  UserCreateRequest, UserUpdateRequest, PasswordResetRequest 
} from '@/types/index';






export const adminKeys = {
  all: ['admin'] as const,
  auditLogs: (params?: AuditLogListParams) => [...adminKeys.all, 'audit-logs', params] as const,
  backups: () => [...adminKeys.all, 'backups'] as const,
  replication: () => [...adminKeys.all, 'replication'] as const,
  config: () => [...adminKeys.all, 'config'] as const,
  users: (params?: UserListParams) => [...adminKeys.all, 'users', params] as const,
};

// --- PROVIDED BY YOU ---

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

// --- ADDED MISSING MUTATIONS/QUERIES FOR UI ---

export const useAdminUsers = (params: UserListParams) =>
  useQuery({
    queryKey: adminKeys.users(params),
    queryFn: async () => (await api.get<UserPaginatedResponse>('/api/users', { params })).data,
  });

export const useToggleUserStatus = (id: string, isActive: boolean) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => api.patch(`/api/users/${id}/${isActive ? 'deactivate' : 'activate'}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.users() })
  });
};

export const useUpdateSystemConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ConfigMap) => (await api.patch<ConfigMap>('/api/admin/config', data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.config() })
  });
};

export const useRestoreBackup = () => useMutation({
  mutationFn: async (id: string) => (await api.post<RestoreResponse>(`/api/admin/backups/${id}/restore`, { confirmToken: 'RESTORE' })).data
});

export const useSyncReplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.post<MessageResponse>(`/api/admin/replication/${id}/sync`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.replication() })
  });
};

export const useDeleteReplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/api/admin/replication/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.replication() })
  });
};


// User management mutations (create/update user, reset password) would be implemented similarly, with appropriate API calls and query invalidations.

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UserCreateRequest) => api.post('/api/users', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.users() })
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UserUpdateRequest }) => 
      api.patch(`/api/users/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.users() })
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PasswordResetRequest }) => 
      api.patch(`/api/users/${id}/password`, data)
  });
};