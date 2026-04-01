// src/pages/dashboard/hooks/useExportReport.ts
import { useCallback, useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { getExportUrl } from '../../../api/dashboard';
import type { DateRange } from '../../../types/dashboard';

export function useExportReport(dateRange?: DateRange) {
  const [isExporting, setIsExporting] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);

  const exportReport = useCallback(
    async (format: 'excel' | 'pdf') => {
      setIsExporting(true);

      try {
        const from = dateRange?.from.toISOString();
        const to = dateRange?.to.toISOString();
        const url = getExportUrl(format, from, to);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Export failed: ${response.statusText}`);
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        const extension = format === 'excel' ? 'xlsx' : 'pdf';
        link.href = downloadUrl;
        link.download = `report-${new Date().toISOString().split('T')[0]}.${extension}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } finally {
        setIsExporting(false);
      }
    },
    [accessToken, dateRange]
  );

  return { exportReport, isExporting };
}