// src/pages/dashboard/components/SkeletonTable.tsx
import React from 'react';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex gap-4 border-b border-gray-100 bg-gray-50 px-6 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-3 flex-1 rounded bg-gray-200" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-3 flex-1 rounded bg-gray-100"
              style={{ maxWidth: colIdx === 0 ? '40%' : '25%' }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}