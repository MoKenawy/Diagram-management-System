import { useState, useCallback } from 'react';
import type { DiagramSummaryResponse, Role } from '@/types/index';
import { formatStorageSize } from '@/utils/formatters';
import { useThumbnailUrl } from '@/hooks/useThumbnailUrl';
import { DiagramCardMenu } from './DiagramCardMenu';

interface DiagramCardProps {
  diagram: DiagramSummaryResponse;
  userRole: Role;
  onClick: (id: string) => void;
  onDownload: (diagramId: string, versionId: string) => void;
  onEditMetadata?: (id: string) => void;
  onManageAccess?: (id: string) => void;
  onUploadRevision?: (id: string) => void;
  onDeactivate?: (id: string) => void;
}

const PRIVILEGED_ROLES: Role[] = ['DC' as Role, 'ADMIN' as Role];

const getFormatBadgeColor = (format?: string) => {
  const f = format?.toLowerCase();
  if (f === 'pdf') return 'bg-secondary text-on-secondary';
  if (f === 'rvt') return 'bg-primary text-on-primary';
  return 'bg-tertiary text-on-tertiary'; // DWG and others
};

export const DiagramCard = ({
  diagram,
  userRole,
  onClick,
  onDownload,
  onEditMetadata,
  onManageAccess,
  onUploadRevision,
  onDeactivate,
}: DiagramCardProps) => {
  const [_, setIsHovered] = useState(false);

  const currentVersion = diagram.currentVersion;
  const thumbnailUrl = useThumbnailUrl(diagram.id, currentVersion?.id);
  const canManage = PRIVILEGED_ROLES.includes(userRole);

  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentVersion) {
      onDownload(diagram.id, currentVersion.id);
    }
  }, [currentVersion, diagram.id, onDownload]);

  return (
    <div
      onClick={() => onClick(diagram.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-surface-container-lowest rounded-xl overflow-hidden group hover:bg-surface-container-highest transition-colors duration-300 flex flex-col h-full border border-surface-container-low cursor-pointer"
    >
      <div className="aspect-[4/3] bg-surface-container relative overflow-hidden p-2">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={diagram.title}
            className="w-full h-full object-cover rounded-lg opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 mix-blend-multiply filter grayscale contrast-125"
          />
        ) : (
          <div className="w-full h-full object-cover rounded-lg bg-surface-variant/50 flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">description</span>
          </div>
        )}
        
        {currentVersion?.revisionLabel && (
          <div className="absolute top-4 right-4 bg-surface/80 backdrop-blur-md px-2 py-1 rounded text-[0.65rem] font-bold tracking-widest uppercase text-on-surface shadow-sm">
            {currentVersion.revisionLabel}
          </div>
        )}
        
        {currentVersion?.fileFormat && (
          <div className={`absolute top-4 left-4 ${getFormatBadgeColor(currentVersion.fileFormat)} px-2 py-1 rounded text-[0.65rem] font-bold tracking-widest uppercase shadow-sm`}>
            {currentVersion.fileFormat}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className="text-base font-semibold text-on-surface line-clamp-2 leading-tight flex-1">
            {diagram.title}
          </h3>
          {canManage && (
            <div onClick={e => e.stopPropagation()}>
              <DiagramCardMenu
                onEditMetadata={() => onEditMetadata?.(diagram.id)}
                onManageAccess={() => onManageAccess?.(diagram.id)}
                onUploadRevision={() => onUploadRevision?.(diagram.id)}
                onDeactivate={() => onDeactivate?.(diagram.id)}
              />
            </div>
          )}
        </div>
        
        <p className="text-xs text-on-surface-variant mb-4 font-mono" dir="ltr">
          ID: {diagram.id.substring(0, 8).toUpperCase()}...
        </p>
        
        <div className="mt-auto space-y-3">
          <div className="flex justify-between items-center text-xs text-on-surface-variant border-t border-outline-variant/20 pt-3">
            <span>{currentVersion ? `تم التعديل: ${new Date(currentVersion.uploadedAt).toLocaleDateString('ar-EG')}` : '—'}</span>
            <span dir="ltr">{currentVersion ? formatStorageSize(currentVersion.fileSizeBytes) : '—'}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onClick(diagram.id); }}
              className="flex-1 py-2 text-center text-sm font-medium border border-outline-variant/30 text-on-surface rounded-md hover:bg-surface-container-low transition-colors"
            >
              عرض
            </button>
            {currentVersion && (
              <button 
                onClick={handleDownload}
                className="flex-[0.6] py-2 text-center text-sm font-medium bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-md shadow-sm hover:opacity-90 transition-opacity active:scale-[0.98] flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};