// src/pages/dashboard/components/EmptyState.tsx
import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface EmptyStateProps {
  message: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ message, description, icon, action }: EmptyStateProps) {
  const { isRTL } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
      {icon ?? (
        <svg
          className="mb-4 h-20 w-20 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      )}

      <h3 className="text-lg font-semibold text-gray-600">{message}</h3>

      {description && (
        <p className="mt-1 max-w-sm text-sm text-gray-400">{description}</p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}