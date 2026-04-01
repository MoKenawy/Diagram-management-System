// src/pages/dashboard/components/SkeletonCard.tsx
import React from 'react';
import clsx from 'clsx';

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export function SkeletonCard({ className, lines = 2 }: SkeletonCardProps) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-xl border border-gray-100 bg-white p-6 shadow-sm',
        className
      )}
    >
      <div className="mb-3 h-4 w-1/3 rounded bg-gray-200" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'h-3 rounded bg-gray-200',
            i === lines - 1 ? 'w-2/3' : 'w-full',
            i > 0 && 'mt-2'
          )}
        />
      ))}
    </div>
  );
}

interface SkeletonKPIRowProps {
  count?: number;
}

export function SkeletonKPIRow({ count = 4 }: SkeletonKPIRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="mb-2 h-3 w-24 rounded bg-gray-200" />
          <div className="h-8 w-16 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}