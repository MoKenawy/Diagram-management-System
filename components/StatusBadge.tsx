// src/pages/dashboard/components/StatusBadge.tsx
import React from 'react';
import clsx from 'clsx';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  neutral: 'bg-gray-100 text-gray-700 border-gray-200',
};

const pulseColors: Record<BadgeVariant, string> = {
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-gray-500',
};

export function StatusBadge({ label, variant, pulse }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant]
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={clsx(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              pulseColors[variant]
            )}
          />
          <span
            className={clsx(
              'relative inline-flex h-2 w-2 rounded-full',
              pulseColors[variant]
            )}
          />
        </span>
      )}
      {label}
    </span>
  );
}