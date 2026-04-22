// src/pages/ArchivePage.tsx
import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { useAuthStore } from '@/stores/authStore';
import { useArchiveSearch } from '@/hooks/useArchiveSearch';
import { useArchiveQuery } from '@/hooks/queries/useArchiveQuery';
import { useDiagramDownload } from '@/hooks/useDiagramDownload';
import { Role, type FileFormat } from '@/types/index';

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
    hasActiveFilters,
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
  const isDC = userRole === Role.DC || userRole === Role.ADMIN;

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
    <div className="bg-surface text-on-surface min-h-screen font-sans" dir="rtl">
      {/* Side NavBar */}
      <nav className="hidden md:flex flex-col w-72 bg-surface-container-low h-screen fixed top-0 right-0 border-l border-outline-variant/20 z-20">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined rounded">architecture</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-on-surface">إدارة المخططات</span>
          </div>
        </div>

        <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-on-surface-variant/70 uppercase tracking-wider mb-2 ml-2">القائمة الرئيسية</div>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-semibold transition-colors group" href="#">
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            أرشيف المخططات
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container-high transition-colors group" href="#">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-on-surface">dashboard</span>
            لوحة التحكم
          </a>
          {isDC && (
            <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container-high transition-colors group" href="#">
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-on-surface">upload_file</span>
              رفع مخطط جديد
            </a>
          )}
        </div>
      </nav>

      <main className="md:mr-72 min-h-screen flex flex-col">


        {/* Page Header & Filters */}
        <div className="px-8 py-6 mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-on-surface tracking-tight">أرشيف المخططات</h1>
              <p className="text-on-surface-variant mt-1">تصفح وإدارة جميع المخططات الهندسية في النظام</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <ViewToggle view={view} onChange={setView} />

              {isDC && (
                <button
                  onClick={() => navigate({ to: '/diagrams/create' })}
                  className="w-full md:w-auto px-6 py-2 rounded-full bg-gradient-to-r from-primary to-[#2e7d32] text-on-primary shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="material-symbols-outlined text-[20px]">upload</span>
                  رفع مخطط
                </button>
              )}
            </div>
          </div>

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
        </div>

        {/* Content Grid */}
        <div className="px-8 pb-12 flex-1 mx-auto w-full">
          {renderContent()}

          {pagination && pagination.total > 0 && (
            <ArchivePagination
              pagination={pagination}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default ArchivePage;