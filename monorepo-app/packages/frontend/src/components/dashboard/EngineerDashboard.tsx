// src/pages/dashboard/EngineerDashboard.tsx
import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Box } from '@mui/material';
import { useAuthStore } from '@/stores/authStore';
import { useRecentDiagrams } from '@/hooks/queries/useDiagramQueries';
import { EngineerGreeting } from '@/components/dashboard/engineer/EngineerGreeting';
import { EngineerQuickSearch } from '@/components/dashboard/engineer/EngineerQuickSearch';
import { RecentDiagramsGrid } from '@/components/dashboard/engineer/RecentDiagramsGrid';

export const EngineerDashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { data, isLoading } = useRecentDiagrams(7);

  const handleSearch = useCallback(
    (query: string) => {
      navigate({ to: '/archive', search: { search: query } });
    },
    [navigate]
  );

  const handleDiagramClick = useCallback(
    (id: string) => {
      navigate({ to: '/diagrams/$id', params: { id } });
    },
    [navigate]
  );

  return (
    <Box>
      <EngineerGreeting fullName={user?.fullName ?? ''} />
      <EngineerQuickSearch onSearch={handleSearch} />
      <RecentDiagramsGrid
        diagrams={data?.data ?? []}
        isLoading={isLoading}
        onDiagramClick={handleDiagramClick}
      />
    </Box>
  );
};