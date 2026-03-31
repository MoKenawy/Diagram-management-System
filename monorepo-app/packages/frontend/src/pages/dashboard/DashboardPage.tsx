// src/pages/dashboard/DashboardPage.tsx
import React, { Suspense, lazy } from 'react';
import { useAuthStore, type UserRole } from '../../store/authStore';
import { useLanguage } from '../../hooks/useLanguage';

// Lazy load role-specific dashboards for code splitting
const EngineerDashboard = lazy(() =>
  import('./EngineerDashboard').then((m) => ({ default: m.EngineerDashboard }))
);
const DCDashboard = lazy(() =>
  import('./DCDashboard').then((m) => ({ default: m.DCDashboard }))
);
const ManagerDashboard = lazy(() =>
  import('./ManagerDashboard').then((m) => ({ default: m.ManagerDashboard }))
);
const AdminDashboard = lazy(() =>
  import('./AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

function DashboardFallback() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Skeleton header */}
      <div className="animate-pulse">
        <div className="h-8 w-64 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-40 rounded bg-gray-100" />
      </div>

      {/* Skeleton KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-3 h-3 w-20 rounded bg-gray-200" />
            <div className="h-8 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Skeleton content blocks */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 h-4 w-32 rounded bg-gray-200" />
            <div className="h-48 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

const ROLE_DASHBOARD_MAP: Record<UserRole, React.ComponentType> = {
  VIEWER: EngineerDashboard, // Viewers see same as engineers (read-only)
  ENGINEER: EngineerDashboard,
  DC: DCDashboard,
  MANAGER: ManagerDashboard,
  ADMIN: AdminDashboard,
};

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { t } = useLanguage();

  if (!user) {
    return null;
  }

  const DashboardComponent = ROLE_DASHBOARD_MAP[user.role];

  if (!DashboardComponent) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">{t('common.error')}</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardComponent />
    </Suspense>
  );
}