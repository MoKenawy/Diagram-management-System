// src/pages/dashboard/components/KPICard.tsx
import React from 'react';
import clsx from 'clsx';

interface KPICardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'red';
}

const colorMap = {
  blue: {
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-600',
  },
  green: {
    iconBg: 'bg-green-50',
    iconText: 'text-green-600',
  },
  amber: {
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
  },
  purple: {
    iconBg: 'bg-purple-50',
    iconText: 'text-purple-600',
  },
  red: {
    iconBg: 'bg-red-50',
    iconText: 'text-red-600',
  },
};

const trendColorMap = {
  up: 'text-green-600',
  down: 'text-red-600',
  neutral: 'text-gray-500',
};

export function KPICard({
  label,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
}: KPICardProps) {
  const colors = colorMap[color];

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>

          {(subtitle || trend) && (
            <div className="mt-2 flex items-center gap-2">
              {trend && (
                <span
                  className={clsx(
                    'flex items-center gap-0.5 text-xs font-medium',
                    trendColorMap[trend.direction]
                  )}
                >
                  {trend.direction === 'up' && '↑'}
                  {trend.direction === 'down' && '↓'}
                  {trend.label}
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-gray-400">{subtitle}</span>
              )}
            </div>
          )}
        </div>

        <div
          className={clsx(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            colors.iconBg,
            colors.iconText
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}