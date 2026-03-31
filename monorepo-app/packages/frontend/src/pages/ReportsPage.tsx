// src/pages/ReportsPage.tsx
import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

export function ReportsPage() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h1>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors">
          {t('reports.generate')}
        </button>
      </div>
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500">{t('common.noData')}</p>
      </div>
    </div>
  );
}