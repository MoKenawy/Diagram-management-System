// src/pages/dashboard/EngineerDashboard.tsx
import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useLanguage } from '../../hooks/useLanguage';
import { formatDate } from '../../utils/format';
import { useRecentDiagrams } from './hooks/useDashboardQueries';
import { DiagramCard } from './components/DiagramCard';
import { QuickSearchBar } from './components/QuickSearchBar';
import { EmptyState } from './components/EmptyState';
import { SkeletonCard } from './components/SkeletonCard';

const RECENT_DAYS = 7;

export function EngineerDashboard() {
  const { t, lang } = useLanguage();
  const user = useAuthStore((state) => state.user);
  const { data: diagrams, isLoading, isError, refetch } = useRecentDiagrams(RECENT_DAYS);

  const greeting = t('dashboard.welcome', { name: user?.fullName ?? '' });
  const todayFormatted = formatDate(new Date(), lang);

  return (
    <div className="space-y-8">
      {/* Greeting Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{greeting}</h1>
        <p className="mt-1 text-sm text-gray-500">{todayFormatted}</p>
      </div>

      {/* Quick Search */}
      <section>
        <QuickSearchBar />
      </section>

      {/* Recent Diagrams Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('dashboard.recentActivity')}
          </h2>
          <span className="text-xs text-gray-400">
            {lang === 'ar' ? `آخر ${RECENT_DAYS} أيام` : `Last ${RECENT_DAYS} days`}
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} lines={3} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <EmptyState
            message={t('common.error')}
            description={t('errors.networkError')}
            action={{
              label: t('common.retry'),
              onClick: () => refetch(),
            }}
            icon={
              <svg
                className="mb-4 h-20 w-20 text-red-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            }
          />
        )}

        {/* Empty State */}
        {!isLoading && !isError && diagrams && diagrams.length === 0 && (
          <EmptyState
            message={lang === 'ar' ? 'لا توجد لوحات جديدة' : 'No new diagrams'}
            description={
              lang === 'ar'
                ? 'لم يتم رفع أي لوحات في الأيام السبعة الأخيرة'
                : 'No diagrams have been uploaded in the last seven days'
            }
          />
        )}

        {/* Diagram Grid */}
        {!isLoading && !isError && diagrams && diagrams.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {diagrams.map((diagram) => (
              <DiagramCard key={diagram.id} diagram={diagram} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}