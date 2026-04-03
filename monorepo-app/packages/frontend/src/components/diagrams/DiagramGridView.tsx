// src/components/diagrams/DiagramGridView.tsx
import { Grid } from '@mui/material';
import { DiagramCard } from './DiagramCard';
import { DiagramCardSkeleton } from './DiagramCardSkeleton';
import type { DiagramSummaryResponse, Role } from '@/types/index';

const SKELETON_COUNT = 12;

interface DiagramGridViewProps {
  diagrams: DiagramSummaryResponse[];
  userRole: Role;
  isLoading: boolean;
  onClick: (id: string) => void;
  onDownload: (diagramId: string, versionId: string) => void;
  onEditMetadata?: (id: string) => void;
  onManageAccess?: (id: string) => void;
  onUploadRevision?: (id: string) => void;
  onDeactivate?: (id: string) => void;
}

export const DiagramGridView = ({
  diagrams,
  userRole,
  isLoading,
  onClick,
  onDownload,
  onEditMetadata,
  onManageAccess,
  onUploadRevision,
  onDeactivate,
}: DiagramGridViewProps) => {
  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
            <DiagramCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {diagrams.map((diagram) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={diagram.id}>
          <DiagramCard
            diagram={diagram}
            userRole={userRole}
            onClick={onClick}
            onDownload={onDownload}
            onEditMetadata={onEditMetadata}
            onManageAccess={onManageAccess}
            onUploadRevision={onUploadRevision}
            onDeactivate={onDeactivate}
          />
        </Grid>
      ))}
    </Grid>
  );
};