// src/hooks/queries/useDepartmentQueries.ts
import { useQuery } from '@tanstack/react-query';
import { privateApi as api } from '@/api/axiosClient';
import type { DepartmentBasic } from '@/types/index';

export const departmentKeys = {
  all: ['departments'] as const,
  active: () => [...departmentKeys.all, 'active'] as const,
};

const getActiveDepartments = async (): Promise<DepartmentBasic[]> => {
  const response = await api.get<DepartmentBasic[]>('/api/departments');
  return response.data;
};

export const useActiveDepartments = () =>
  useQuery({
    queryKey: departmentKeys.active(),
    queryFn: getActiveDepartments,
    staleTime: 5 * 60_000,
  });