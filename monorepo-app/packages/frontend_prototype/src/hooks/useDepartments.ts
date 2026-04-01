// src/hooks/useDepartments.ts

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';
import type { Department } from '@/types/index';

/**
 * Fetches the list of departments for filtering.
 */
export function useDepartments(enabled: boolean = true) {
  return useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await apiClient.get<Department[]>('/departments');
      return data;
    },
    enabled,
    staleTime: 5 * 60_000,
  });
}