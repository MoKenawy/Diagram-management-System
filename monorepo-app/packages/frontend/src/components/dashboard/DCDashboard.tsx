// src/pages/dashboard/DCDashboard.tsx
import { useState } from 'react';
import { Box, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useReportSummary } from '@/hooks/queries/useReportQueries';
import { useDiagramList } from '@/hooks/queries/useDiagramQueries';
import { DCStatRow } from '@/components/dashboard/dc/DCStatRow';
import { RecentUploadsTable } from '@/components/dashboard/dc/RecentUploadsTable';
import { SectionHeader } from '@/components/shared/SectionHeader';

import { CreateDiagramModal } from '@/components/diagrams/CreateDiagramModal';

export const DCDashboard = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);



  const { data: summary, isLoading: summaryLoading } = useReportSummary();
  const { data: recentDiagrams, isLoading: diagramsLoading } = useDiagramList({
    limit: 10,
  });

  return (
    <Box>
      <SectionHeader
        title="لوحة التحكم"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setIsCreateOpen(true)}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(90deg, #2e7d32, #66bb6a)',
            }}
          >
            + رفع لوحة جديدة
          </Button>
        }
      />



      <DCStatRow summary={summary} isLoading={summaryLoading} />

      <RecentUploadsTable
        diagrams={recentDiagrams?.data ?? []}
        isLoading={diagramsLoading}
      />

      <CreateDiagramModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </Box>
  );
};