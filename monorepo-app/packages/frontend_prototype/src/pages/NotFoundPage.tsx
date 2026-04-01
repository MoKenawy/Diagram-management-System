// src/pages/NotFoundPage.tsx
import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

export function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-2 text-6xl font-bold text-gray-300">404</h1>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          {t('errors.notFound')}
        </h2>
        <p className="mb-6 text-gray-600">{t('errors.notFoundMessage')}</p>
        <a
          href="/dashboard"
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
        >
          {t('errors.goHome')}
        </a>
      </div>
    </div>
  );
}