// src/components/dashboard/engineer/RecentDiagramsGrid.tsx
import { Grid, Box } from '@mui/material';
import { DiagramCard, DiagramCardSkeleton } from '@/components/shared/DiagramCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { InboxOutlined } from '@mui/icons-material';
import type { DiagramSummaryResponse } from '@/types/index';

interface RecentDiagramsGridProps {
  diagrams: DiagramSummaryResponse[];
  isLoading: boolean;
  onDiagramClick: (id: string) => void;
}

const SKELETON_COUNT = 6;

export const RecentDiagramsGrid = ({
  diagrams,
  isLoading,
  onDiagramClick,
}: RecentDiagramsGridProps) => (
  <Box>
    <SectionHeader title="اللوحات الجديدة" />

    {isLoading ? (
      <Grid container spacing={2}>
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
            <DiagramCardSkeleton />
          </Grid>
        ))}
      </Grid>
    ) : diagrams.length === 0 ? (
      <EmptyState
        icon={<InboxOutlined />}
        title="لا توجد لوحات جديدة"
        description="لم يتم رفع أي لوحات خلال الأسبوع الماضي"
      />
    ) : (
      <Grid container spacing={2}>
        {diagrams.map((diagram) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={diagram.id}>
            <DiagramCard diagram={diagram} onClick={onDiagramClick} />
          </Grid>
        ))}
      </Grid>
    )}
  </Box>
);