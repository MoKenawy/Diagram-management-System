// src/hooks/useDiagramFilters.ts

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { DiagramFiltersParams, FileFormat } from '@/types/index';

const VALID_FORMATS: FileFormat[] = ['PDF', 'DWG', 'SVG', 'PNG', 'JPEG'];
const VALID_PAGE_SIZES = [10, 20, 50];

/**
 * Synchronizes diagram filter state with URL search params.
 */
export function useDiagramFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: DiagramFiltersParams = useMemo(() => {
    const formats = searchParams.get('formats')?.split(',').filter(
      (f): f is FileFormat => VALID_FORMATS.includes(f as FileFormat)
    ) || [];

    const departmentIds = searchParams.get('departmentIds')?.split(',').filter(Boolean) || [];

    const rawPageSize = Number(searchParams.get('pageSize'));
    const pageSize = VALID_PAGE_SIZES.includes(rawPageSize) ? rawPageSize : 20;

    const rawPage = Number(searchParams.get('page'));
    const page = rawPage > 0 ? rawPage : 1;

    return {
      search: searchParams.get('search') || undefined,
      formats: formats.length > 0 ? formats : undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      departmentIds: departmentIds.length > 0 ? departmentIds : undefined,
      page,
      pageSize,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined,
    };
  }, [searchParams]);

  const setFilters = useCallback(
    (updates: Partial<DiagramFiltersParams>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        Object.entries(updates).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') {
            next.delete(key);
          } else if (Array.isArray(value)) {
            if (value.length > 0) {
              next.set(key, value.join(','));
            } else {
              next.delete(key);
            }
          } else {
            next.set(key, String(value));
          }
        });

        // Reset to page 1 when filters change (unless page itself is being set)
        if (!('page' in updates)) {
          next.set('page', '1');
        }

        return next;
      });
    },
    [setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.search ||
      filters.formats?.length ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.departmentIds?.length
    );
  }, [filters]);

  return {
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
  };
}