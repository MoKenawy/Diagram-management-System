// src/hooks/useReportExport.ts
import { useCallback, useState } from 'react';
import { exportReport } from '@/services/api/reportService';
import type { ReportDateParams, ReportExportFormat } from '@/types/index';

export const useReportExport = (dateParams: ReportDateParams) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(
    async (format: ReportExportFormat) => {
      setIsExporting(true);
      try {
        const blob = await exportReport({ ...dateParams, format });
        const extension = format === 'pdf' ? 'pdf' : 'xlsx';
        const filename = `report-${new Date().toISOString().split('T')[0]}.${extension}`;

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(url);
      } finally {
        setIsExporting(false);
      }
    },
    [dateParams]
  );

  return { handleExport, isExporting } as const;
};