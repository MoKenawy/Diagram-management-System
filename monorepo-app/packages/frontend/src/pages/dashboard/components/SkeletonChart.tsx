// src/pages/dashboard/components/SkeletonChart.tsx
import React from 'react';
import clsx from 'clsx';

interface SkeletonChartProps {
  className?: string;
  height?: string;
}

export function SkeletonChart({ className, height = 'h-72' }: SkeletonChartProps) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-xl border border-gray-100 bg-white p-6 shadow-sm',
        className
      )}
    >
      <div className="mb-4 h-4 w-1/4 rounded bg-gray-200" />
      <div className={clsx('flex items-end gap-2', height)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gray-100"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}