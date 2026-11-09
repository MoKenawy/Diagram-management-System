// src/components/dashboard/dc/DCStatRow.tsx
import { Grid } from '@mui/material';
import { KpiCard } from '@/components/shared/KpiCard';
import { CloudUpload, GridView } from '@mui/icons-material';
import { formatNumber } from '@/utils/formatters';
import type { ReportSummaryResponse } from '@/types/index';

interface DCStatRowProps {
  summary: ReportSummaryResponse | undefined;
  isLoading: boolean;
}

export const DCStatRow = ({ summary, isLoading }: DCStatRowProps) => (
  <Grid container spacing={2} mb={3}>
    <Grid size={{ xs: 12, sm: 6 }}>
      <KpiCard
        title="رفع هذا الشهر"
        value={formatNumber(summary?.uploadsThisMonth ?? 0)}
        icon={<CloudUpload />}
        color="#1565c0"
        isLoading={isLoading}
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <KpiCard
        title="إجمالي اللوحات"
        value={formatNumber(summary?.totalActiveDiagrams ?? 0)}
        icon={<GridView />}
        color="#0059bb"
        isLoading={isLoading}
      />
    </Grid>
  </Grid>
);