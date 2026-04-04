// src/hooks/useArchiveSearch.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { ArchiveSearchParams } from '@/validations/archiveSearchSchema'; // Correct path
import type { FileFormat } from '@/types/index'; // Corrected import path
import { Route as ArchiveRoute } from '@/routes/_authenticated/archive';

const DEBOUNCE_MS = 300;


export const useArchiveSearch = () => {
  const navigate = useNavigate();
  // Provide the type argument to useSearch to help TypeScript infer
  const search: ArchiveSearchParams = ArchiveRoute.useSearch();
  const [searchInput, setSearchInput] = useState(search.search ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Initialize useRef

  // Sync URL → local input when navigating back/forward
  useEffect(() => {
    setSearchInput(search.search ?? '');
  }, [search.search]);

  const updateSearch = useCallback(
    (updates: Partial<ArchiveSearchParams>) => {
      navigate({
        to: '/archive',
        search: (prev) => ({
          ...(prev as ArchiveSearchParams), // Cast prev for type safety
          ...updates,
          page: 'page' in updates ? updates.page : 1, // Reset page on filter change
        }),
        replace: true,
      });
    },
    [navigate]
  );

  const handleSearchInput = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        updateSearch({ search: value || undefined });
      }, DEBOUNCE_MS);
    },
    [updateSearch]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const setPage = useCallback(
    (page: number) => updateSearch({ page }),
    [updateSearch]
  );

  const setLimit = useCallback(
    (limit: number) => updateSearch({ limit, page: 1 }), // Reset page to 1 when limit changes
    [updateSearch]
  );

  const setView = useCallback(
    (view: 'grid' | 'table') => updateSearch({ view }),
    [updateSearch]
  );

  const toggleFileFormat = useCallback(
    (format: FileFormat) => {
      const current = search.fileFormat ?? [];
      const next = current.includes(format)
        ? current.filter((f) => f !== format)
        : [...current, format];
      updateSearch({ fileFormat: next.length > 0 ? next : undefined });
    },
    [search.fileFormat, updateSearch]
  );

  const setDepartments = useCallback(
    (ids: string[]) => {
      updateSearch({ departmentId: ids.length > 0 ? ids : undefined });
    },
    [updateSearch]
  );

  const setDateRange = useCallback(
    (from?: string, to?: string) => {
      updateSearch({ uploadedFrom: from, uploadedTo: to });
    },
    [updateSearch]
  );

  const clearAllFilters = useCallback(() => {
    setSearchInput('');
    // Retain view preference when clearing other filters
    navigate({
      to: '/archive',
      search: { view: search.view },
      replace: true,
    });
  }, [navigate, search.view]);

  // Check for active filters
  const hasActiveFilters =
    !!search.search ||
    (search.fileFormat?.length ?? 0) > 0 ||
    (search.departmentId?.length ?? 0) > 0 ||
    !!search.uploadedFrom ||
    !!search.uploadedTo;

  return {
    search,
    searchInput,
    hasActiveFilters,
    handleSearchInput,
    setPage,
    setLimit,
    setView,
    toggleFileFormat,
    setDepartments,
    setDateRange,
    clearAllFilters,
  } as const;
};