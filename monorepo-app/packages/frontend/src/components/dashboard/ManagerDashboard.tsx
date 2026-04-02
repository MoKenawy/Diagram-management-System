// src/pages/dashboard/ManagerDashboard.tsx
import { Box, Grid, Stack } from '@mui/material';
import { useDateRange } from '@/hooks/useDateRange';
import { useReportExport } from '@/hooks/useReportExport';
import {
  useReportSummary,
  useUploadsOverTime,
  useAccessByDepartment,
} from '@/hooks/queries/useReportQueries';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { ManagerKpiRow } from '@/components/dashboard/manager/ManagerKpiRow';
import { UploadsChart } from '@/components/dashboard/manager/UploadsChart';
import { DepartmentDownloadsChart } from '@/components/dashboard/manager/DepartmentDownloadsChart';
import { ExportButton } from '@/components/dashboard/manager/ExportButton';

export const ManagerDashboard = () => {
  const { from, to, params, setFromDate, setToDate } = useDateRange();
  const { handleExport, isExporting } = useReportExport(params);

  const { data: summary, isLoading: summaryLoading } = useReportSummary(params);
  const { data: uploads, isLoading: uploadsLoading } = useUploadsOverTime(params);
  const { data: departments, isLoading: deptsLoading } = useAccessByDepartment(params);

  return (
    <Box>
      <SectionHeader
        title="التقارير والإحصائيات"
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <DateRangePicker
              from={from}
              to={to}
              onFromChange={setFromDate}
              onToChange={setToDate}
            />
            <ExportButton
              onExport={handleExport}
              isExporting={isExporting}
              format={'excel' as const}
              label="Excel"
            />
            <ExportButton
              onExport={handleExport}
              isExporting={isExporting}
              format={'pdf' as const}
              label="PDF"
            />
          </Stack>
        }
      />

      <ManagerKpiRow summary={summary} isLoading={summaryLoading} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <UploadsChart data={uploads ?? []} isLoading={uploadsLoading} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DepartmentDownloadsChart data={departments ?? []} isLoading={deptsLoading} />
        </Grid>
      </Grid>
    </Box>
  );
};