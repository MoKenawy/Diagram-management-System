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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <div key={i}>
            <DiagramCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {diagrams.map((diagram) => (
        <div key={diagram.id}>
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
        </div>
      ))}
    </div>
  );
};