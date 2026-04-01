// src/pages/dashboard/components/DiagramCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../hooks/useLanguage';
import { timeAgo } from '../../../utils/format';
import type { DiagramSummary } from '../../../types/dashboard';

interface DiagramCardProps {
  diagram: DiagramSummary;
}

export function DiagramCard({ diagram }: DiagramCardProps) {
  const { t, lang } = useLanguage();

  return (
    <Link
      to={`/diagrams/${diagram.id}`}
      className="group block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {diagram.thumbnailUrl ? (
          <img
            src={diagram.thumbnailUrl}
            alt={diagram.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-12 w-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
              />
            </svg>
          </div>
        )}

        {/* Revision badge */}
        <span className="absolute end-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {diagram.currentRevisionLabel}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="mb-1 truncate text-sm font-semibold text-gray-900 group-hover:text-blue-600">
          {diagram.title}
        </h3>

        <p className="mb-2 truncate text-xs text-gray-500">
          {diagram.stationName}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{diagram.uploadedBy.fullName}</span>
          <span>{timeAgo(diagram.uploadedAt, lang)}</span>
        </div>
      </div>
    </Link>
  );
}