import { useMemo } from 'react';
import type { UserEngineerResponse } from '@/types/index';

export function useActiveEngineersSearch(
  engineers: UserEngineerResponse[],
  searchQuery: string
) {
  return useMemo(() => {
    if (!searchQuery.trim()) {
      return engineers;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();

    return engineers.filter((engineer) => {
      return (
        engineer.fullName.toLowerCase().includes(lowerCaseQuery) ||
        engineer.username.toLowerCase().includes(lowerCaseQuery)
      );
    });
  }, [engineers, searchQuery]);
}