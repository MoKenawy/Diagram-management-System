// src/pages/dashboard/components/QuickSearchBar.tsx
import React, { useState, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';

export function QuickSearchBar() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (trimmed) {
        navigate(`/archive?search=${encodeURIComponent(trimmed)}`);
      }
    },
    [query, navigate]
  );

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-lg">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('archive.search')}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pe-4 ps-12 text-sm text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />

        {/* Search icon */}
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Submit button */}
        {query.trim() && (
          <button
            type="submit"
            className="absolute inset-y-0 end-0 flex items-center pe-3"
          >
            <svg
              className="h-5 w-5 text-blue-600 transition-colors hover:text-blue-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}