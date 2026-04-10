// src/hooks/queries/useDiagramDetailQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { privateApi as api } from '@/api/axiosClient';
import { diagramKeys } from './useDiagramQueries';
import type {
  DiagramDetailResponse,
  DiagramVersionResponse,
  DiagramAccessRuleResponse,
  DiagramAccessRuleCreateRequest,
  DiagramUpdateRequest,
  UserEngineerResponse,
  DepartmentBasic,
} from '@/types/index';

// ─── Keys ────────────────────────────────────────────────────────

export const diagramDetailKeys = {
  versions: (diagramId: string) => [...diagramKeys.detail(diagramId), 'versions'] as const,
  access: (diagramId: string) => [...diagramKeys.detail(diagramId), 'access'] as const,
  engineers: () => ['users', 'engineers'] as const,
  departments: () => ['departments', 'active'] as const,
};

// ─── Detail ──────────────────────────────────────────────────────

export const useDiagramDetail = (id: string) =>
  useQuery({
    queryKey: diagramKeys.detail(id),
    queryFn: async (): Promise<DiagramDetailResponse> => {
      const res = await api.get<DiagramDetailResponse>(`/api/diagrams/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

// ─── Versions ────────────────────────────────────────────────────

export const useDiagramVersions = (diagramId: string) =>
  useQuery({
    queryKey: diagramDetailKeys.versions(diagramId),
    queryFn: async (): Promise<DiagramVersionResponse[]> => {
      const res = await api.get<DiagramVersionResponse[]>(
        `/api/diagrams/${diagramId}/versions`
      );
      return res.data;
    },
    enabled: !!diagramId,
  });

// ─── Access Rules ────────────────────────────────────────────────

export const useDiagramAccessRules = (diagramId: string, enabled = true) =>
  useQuery({
    queryKey: diagramDetailKeys.access(diagramId),
    queryFn: async (): Promise<DiagramAccessRuleResponse[]> => {
      const res = await api.get<DiagramAccessRuleResponse[]>(
        `/api/diagrams/${diagramId}/access`
      );
      return res.data;
    },
    enabled: enabled && !!diagramId,
  });

export const useCreateAccessRule = (diagramId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DiagramAccessRuleCreateRequest): Promise<DiagramAccessRuleResponse> => {
      const res = await api.post<DiagramAccessRuleResponse>(
        `/api/diagrams/${diagramId}/access`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diagramDetailKeys.access(diagramId) });
    },
  });
};

export const useDeleteAccessRule = (diagramId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ruleId: string): Promise<void> => {
      await api.delete(`/api/diagrams/${diagramId}/access/${ruleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diagramDetailKeys.access(diagramId) });
    },
  });
};

// ─── Update Diagram ──────────────────────────────────────────────

export const useUpdateDiagram = (diagramId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DiagramUpdateRequest): Promise<DiagramDetailResponse> => {
      const res = await api.patch<DiagramDetailResponse>(
        `/api/diagrams/${diagramId}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diagramKeys.detail(diagramId) });
    },
  });
};

// ─── Deactivate Diagram ──────────────────────────────────────────

export const useDeactivateDiagram = (diagramId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await api.delete(`/api/diagrams/${diagramId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diagramKeys.all });
    },
  });
};

// ─── Engineers & Departments (for AccessManager selectors) ───────

export const useActiveEngineers = () =>
  useQuery({
    queryKey: diagramDetailKeys.engineers(),
    queryFn: async (): Promise<UserEngineerResponse[]> => {
      const res = await api.get<UserEngineerResponse[]>('/api/users/engineers');
      return res.data;
    },
    staleTime: 5 * 60_000,
  });

export const useActiveDepartmentsForAccess = () =>
  useQuery({
    queryKey: diagramDetailKeys.departments(),
    queryFn: async (): Promise<DepartmentBasic[]> => {
      const res = await api.get<DepartmentBasic[]>('/api/departments');
      return res.data;
    },
    staleTime: 5 * 60_000,
  });