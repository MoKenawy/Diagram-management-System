// src/pages/dashboard/components/ProgressBar.tsx
import React from 'react';
import clsx from 'clsx';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  valueLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  colorThresholds?: {
    warning: number;
    danger: number;
  };
}

export function ProgressBar({
  value,
  max,
  label,
  valueLabel,
  size = 'md',
  colorThresholds = { warning: 70, danger: 90 },
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  const barColor =
    percentage >= colorThresholds.danger
      ? 'bg-red-500'
      : percentage >= colorThresholds.warning
        ? 'bg-amber-500'
        : 'bg-blue-500';

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  return (
    <div>
      {(label || valueLabel) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {valueLabel && (
            <span className="text-sm text-gray-500">{valueLabel}</span>
          )}
        </div>
      )}

      <div className={clsx('w-full overflow-hidden rounded-full bg-gray-200', heightClass)}>
        <div
          className={clsx('rounded-full transition-all duration-500', barColor, heightClass)}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}