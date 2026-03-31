// src/pages/dashboard/components/DateRangePicker.tsx
import React, { useCallback } from 'react';
import { useLanguage } from '../../../hooks/useLanguage';
import type { DateRange } from '../../../types/dashboard';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const { t } = useLanguage();

  const handleFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newFrom = new Date(e.target.value);
      if (!isNaN(newFrom.getTime())) {
        onChange({ ...value, from: newFrom });
      }
    },
    [value, onChange]
  );

  const handleToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTo = new Date(e.target.value);
      if (!isNaN(newTo.getTime())) {
        onChange({ ...value, to: newTo });
      }
    },
    [value, onChange]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label htmlFor="date-from" className="text-sm font-medium text-gray-600">
          {t('reports.from')}
        </label>
        <input
          id="date-from"
          type="date"
          value={toLocalDateString(value.from)}
          onChange={handleFromChange}
          max={toLocalDateString(value.to)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="date-to" className="text-sm font-medium text-gray-600">
          {t('reports.to')}
        </label>
        <input
          id="date-to"
          type="date"
          value={toLocalDateString(value.to)}
          onChange={handleToChange}
          min={toLocalDateString(value.from)}
          max={toLocalDateString(new Date())}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}