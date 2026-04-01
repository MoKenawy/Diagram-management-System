// src/pages/DashboardPage.tsx
import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../hooks/useLanguage';

export function DashboardPage() {
  const { t } = useLanguage();
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {t('dashboard.welcome', { name: user?.fullName || '' })}
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stats cards placeholder */}
        {[
          { label: t('dashboard.totalDocuments'), value: '—' },
          { label: t('dashboard.totalDiagrams'), value: '—' },
          { label: t('dashboard.storageUsed'), value: '—' },
          { label: t('dashboard.pendingSync'), value: '—' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('dashboard.recentActivity')}
          </h2>
          <p className="text-gray-500">{t('common.noData')}</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('dashboard.systemStatus')}
          </h2>
          <p className="text-gray-500">{t('common.noData')}</p>
        </div>
      </div>
    </div>
  );
}