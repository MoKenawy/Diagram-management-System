// src/pages/DiagramPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';

export function DiagramPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {t('diagrams.viewer')} — {id}
      </h1>
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    </div>
  );
}