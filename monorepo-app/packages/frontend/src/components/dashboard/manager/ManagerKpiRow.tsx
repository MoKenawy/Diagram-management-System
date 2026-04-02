// src/components/dashboard/manager/ManagerKpiRow.tsx
import { Grid } from '@mui/material';
import { KpiCard } from '@/components/shared/KpiCard';
import {
  GridView,
  Layers,
  CloudDownload,
  Storage,
} from '@mui/icons-material';
import { formatNumber, formatStorageSize } from '@/utils/formatters';
import type { ReportSummaryResponse } from '@/types/index';

interface ManagerKpiRowProps {
  summary: ReportSummaryResponse | undefined;
  isLoading: boolean;
}

export const ManagerKpiRow = ({ summary, isLoading }: ManagerKpiRowProps) => {
  const kpis = [
    {
      title: 'إجمالي اللوحات',
      value: formatNumber(summary?.totalActiveDiagrams ?? 0),
      icon: <GridView />,
      color: '#1565c0',
    },
    {
      title: 'إجمالي النسخ',
      value: formatNumber(summary?.totalVersions ?? 0),
      icon: <Layers />,
      color: '#6a1b9a',
    },
    {
      title: 'التحميلات هذا الشهر',
      value: formatNumber(summary?.downloadsThisMonth ?? 0),
      icon: <CloudDownload />,
      color: '#e65100',
    },
    {
      title: 'المساحة المستخدمة',
      value: formatStorageSize(summary?.storageUsedBytes ?? '0'),
      icon: <Storage />,
      color: '#2e7d32',
    },
  ] as const;

  return (
    <Grid container spacing={2} mb={4}>
      {kpis.map((kpi) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={kpi.title}>
          <KpiCard {...kpi} isLoading={isLoading} />
        </Grid>
      ))}
    </Grid>
  );
};