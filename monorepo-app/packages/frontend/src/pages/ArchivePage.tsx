// src/pages/ArchivePage.tsx
import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Box, Fab } from '@mui/material';
import { Add } from '@mui/icons-material';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthStore } from '@/stores/authStore';
import { useArchiveSearch } from '@/hooks/useArchiveSearch';
import { useArchiveQuery } from '@/hooks/queries/useArchiveQuery';
import { useDiagramDownload } from '@/hooks/useDiagramDownload';
import { Role, type FileFormat } from '@/types/index';

import { ArchiveSearchBar } from '@/components/diagrams/ArchiveSearchBar';
import { DiagramFilters } from '@/components/diagrams/DiagramFilters';
import { DiagramGridView } from '@/components/diagrams/DiagramGridView';
import { DiagramTableView } from '@/components/diagrams/DiagramTableView';
import { ViewToggle } from '@/components/diagrams/ViewToggle';
import { ArchivePagination } from '@/components/diagrams/ArchivePagination';
import { ArchiveEmptyState } from '@/components/diagrams/ArchiveEmptyState';
import { ArchiveErrorState } from '@/components/diagrams/ArchiveErrorState';

const ArchivePage = () => {
  const navigate = useNavigate();
  const userRole = useAuthStore((state) => state.user?.role ?? Role.ENGINEER);
  const { download } = useDiagramDownload();

  const {
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
  } = useArchiveSearch();

  const { data, isLoading, isError, refetch } = useArchiveQuery(search);

  const diagrams = data?.data ?? [];
  const pagination = data?.pagination;
  const view = search.view ?? 'grid';
  const isDC = userRole === Role.DC;

  const handleDiagramClick = useCallback(
    (id: string) => navigate({ to: '/diagrams/$id', params: { id } }),
    [navigate]
  );

  const handleDownload = useCallback(
    (diagramId: string, versionId: string) => download(diagramId, versionId),
    [download]
  );

  // TODO: wire these to actual modals
  const handleEditMetadata = useCallback((id: string) => {
    console.log('Edit metadata:', id);
  }, []);

  const handleManageAccess = useCallback((id: string) => {
    console.log('Manage access:', id);
  }, []);

  const handleUploadRevision = useCallback((id: string) => {
    console.log('Upload revision:', id);
  }, []);

  const handleDeactivate = useCallback((id: string) => {
    console.log('Deactivate:', id);
  }, []);

  const renderContent = () => {
    if (isError) {
      return <ArchiveErrorState onRetry={refetch} />;
    }

    if (!isLoading && diagrams.length === 0) {
      return (
        <ArchiveEmptyState
          hasFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
        />
      );
    }

    const sharedProps = {
      diagrams,
      userRole,
      isLoading,
      onDownload: handleDownload,
      onEditMetadata: handleEditMetadata,
      onManageAccess: handleManageAccess,
      onUploadRevision: handleUploadRevision,
      onDeactivate: handleDeactivate,
    };

    return view === 'table' ? (
      <DiagramTableView {...sharedProps} onRowClick={handleDiagramClick} />
    ) : (
      <DiagramGridView {...sharedProps} onClick={handleDiagramClick} />
    );
  };

  return (
    <AppShell>
      <Box display="flex" gap={3}>
        {/* Sidebar Filters */}
        <DiagramFilters
          selectedFormats={(search.fileFormat ?? []) as FileFormat[]}
          selectedDepartments={search.departmentId ?? []}
          uploadedFrom={search.uploadedFrom ?? ''}
          uploadedTo={search.uploadedTo ?? ''}
          userRole={userRole}
          hasActiveFilters={hasActiveFilters}
          onToggleFormat={toggleFileFormat}
          onDepartmentsChange={setDepartments}
          onDateChange={setDateRange}
          onClear={clearAllFilters}
        />

        {/* Main Content */}
        <Box flex={1} minWidth={0}>
          {/* Toolbar */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            gap={2}
            mb={2}
            flexWrap="wrap"
          >
            <Box flex={1} maxWidth={480}>
              <ArchiveSearchBar
                value={searchInput}
                onChange={handleSearchInput}
                disabled={isLoading}
              />
            </Box>
            <ViewToggle view={view} onChange={setView} />
          </Box>

          {/* Results */}
          {renderContent()}

          {/* Pagination */}
          {pagination && pagination.total > 0 && (
            <ArchivePagination
              pagination={pagination}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          )}
        </Box>
      </Box>

      {/* DC FAB */}
      {isDC && (
        <Fab
          color="primary"
          aria-label="رفع لوحة جديدة"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(90deg, #2e7d32, #66bb6a)',
            '&:hover': { background: 'linear-gradient(90deg, #1b5e20, #4caf50)' },
          }}
          onClick={() => navigate({ to: '/diagrams/create' })}
        >
          <Add />
        </Fab>
      )}
    </AppShell>
  );
};

export default ArchivePage;