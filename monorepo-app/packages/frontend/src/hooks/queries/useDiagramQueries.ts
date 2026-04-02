// src/hooks/queries/useDiagramQueries.ts
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getDiagrams } from '@/services/api/diagramService';
import type { DiagramListParams } from '@/types/index';

export const diagramKeys = {
  all: ['diagrams'] as const,
  lists: () => [...diagramKeys.all, 'list'] as const,
  list: (params: DiagramListParams) => [...diagramKeys.lists(), params] as const,
  details: () => [...diagramKeys.all, 'detail'] as const,
  detail: (id: string) => [...diagramKeys.details(), id] as const,
};

export const useDiagramList = (params: DiagramListParams, enabled = true) =>
  useQuery({
    queryKey: diagramKeys.list(params),
    queryFn: () => getDiagrams(params),
    enabled,
  });

const getDaysAgoISODate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  // Truncate to date-only so it stays stable within the same calendar day
  return new Date(date.toISOString().split('T')[0]).toISOString();
};

export const useRecentDiagrams = (daysAgo: number = 7) => {
  const params = useMemo((): DiagramListParams => ({
    uploadedFrom: getDaysAgoISODate(daysAgo),
    limit: 20,
  }), [daysAgo]);

  return useDiagramList(params);
};