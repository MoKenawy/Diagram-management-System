// src/pages/admin/ConfigPage.tsx
import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

export function ConfigPage() {
  const { t } = useLanguage();
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.config.title')}</h2>
      <p className="text-gray-500">{t('common.noData')}</p>
    </div>
  );
}