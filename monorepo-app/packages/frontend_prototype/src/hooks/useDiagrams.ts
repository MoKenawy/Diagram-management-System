// src/hooks/useDiagrams.ts

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';
import type { DiagramFiltersParams, DiagramsResponse } from '@/types/index';

/**
 * Fetches paginated and filtered diagrams from the API.
 */
export function useDiagrams(params: DiagramFiltersParams) {
  return useQuery<DiagramsResponse>({
    queryKey: ['diagrams', params],
    queryFn: async () => {
      const { data } = await apiClient.get<DiagramsResponse>('/diagrams', { params });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}