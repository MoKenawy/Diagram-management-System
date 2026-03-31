// src/pages/dashboard/DCDashboard.tsx
import React, { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../../hooks/useLanguage';
import { formatNumber, formatDate, timeAgo } from '../../utils/format';
import { useReportSummary, useRecentDiagrams } from './hooks/useDashboardQueries';
import { KPICard } from './components/KPICard';
import { StatusBadge } from './components/StatusBadge';
import { CreateDiagramModal } from './components/CreateDiagramModal';
import { EmptyState } from './components/EmptyState';
import { SkeletonKPIRow } from './components/SkeletonCard';
import { SkeletonTable } from './components/SkeletonTable';
import type { DiagramSummary } from '../../types/dashboard';

function DiagramRow({ diagram, lang }: { diagram: DiagramSummary; lang: string }) {
  return (
    <tr className="border-b border-gray-50 transition-colors hover:bg-gray-50 last:border-b-0">
      {/* Thumbnail */}
      <td className="px-4 py-3">
        <div className="h-10 w-14 overflow-hidden rounded bg-gray-100">
          {diagram.thumbnailUrl ? (
            <img
              src={diagram.thumbnailUrl}
              alt={diagram.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg
                className="h-5 w-5 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                />
              </svg>
            </div>
          )}
        </div>
      </td>

      {/* Title */}
      <td className="px-4 py-3">
        <span className="text-sm font-medium text-gray-900">{diagram.title}</span>
      </td>

      {/* Revision */}
      <td className="px-4 py-3">
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
          {diagram.currentRevisionLabel}
        </span>
      </td>

      {/* Upload Date */}
      <td className="px-4 py-3">
        <span className="text-sm text-gray-500" title={formatDate(diagram.uploadedAt, lang)}>
          {timeAgo(diagram.uploadedAt, lang)}
        </span>
      </td>

      {/* Viewer Rules */}
      <td className="px-4 py-3 text-center">
        <span className="text-sm text-gray-600">
          {formatNumber(diagram.viewerRulesCount, lang)}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge
          label={diagram.isActive ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
          variant={diagram.isActive ? 'success' : 'neutral'}
        />
      </td>
    </tr>
  );
}

export function DCDashboard() {
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: summary,
    isLoading: summaryLoading,
  } = useReportSummary();

  const {
    data: recentUploads,
    isLoading: uploadsLoading,
    isError: uploadsError,
    refetch: refetchUploads,
  } = useRecentDiagrams(30);

  const handleUploadSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['diagrams'] });
    queryClient.invalidateQueries({ queryKey: ['reports', 'summary'] });
  }, [queryClient]);

  return (
    <div className="space-y-8">
      {/* Stat Row */}
      {summaryLoading ? (
        <SkeletonKPIRow count={2} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <KPICard
            label={lang === 'ar' ? 'الرفعات هذا الشهر' : 'Uploads This Month'}
            value={formatNumber(summary?.uploadsThisMonth ?? 0, lang)}
            color="blue"
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            }
          />
          <KPICard
            label={t('dashboard.totalDiagrams')}
            value={formatNumber(summary?.totalDiagrams ?? 0, lang)}
            color="purple"
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
            }
          />
        </div>
      )}

      {/* Upload Button */}
      <div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {lang === 'ar' ? '+ رفع لوحة جديدة' : '+ Upload New Diagram'}
        </button>
      </div>

      {/* Recent Uploads Table */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {lang === 'ar' ? 'آخر الرفعات' : 'Recent Uploads'}
        </h2>

        {uploadsLoading && <SkeletonTable rows={5} columns={6} />}

        {uploadsError && !uploadsLoading && (
          <EmptyState
            message={t('common.error')}
            action={{ label: t('common.retry'), onClick: () => refetchUploads() }}
          />
        )}

        {!uploadsLoading && !uploadsError && recentUploads && recentUploads.length === 0 && (
          <EmptyState
            message={t('common.noData')}
            action={{
              label: lang === 'ar' ? '+ رفع لوحة جديدة' : '+ Upload New Diagram',
              onClick: () => setIsModalOpen(true),
            }}
          />
        )}

        {!uploadsLoading && !uploadsError && recentUploads && recentUploads.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {/* Thumbnail */}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {t('archive.fileName')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {t('archive.version')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {t('archive.uploadDate')}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {lang === 'ar' ? 'قواعد العرض' : 'Viewer Rules'}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {t('common.status')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentUploads.map((diagram) => (
                    <DiagramRow key={diagram.id} diagram={diagram} lang={lang} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Create Diagram Modal */}
      <CreateDiagramModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}