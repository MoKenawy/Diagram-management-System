// src/components/diagrams/DiagramCard.tsx

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  ExternalLink,
  Settings,
  Edit,
  Shield,
  Upload,
  XCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuthStore } from '@/store/authStore';
import { formatFileSize, formatDate } from '@/utils/format';
import { FORMAT_BADGE_CONFIG } from '../constants';
import { cn } from '../../../utils/cn';
import type { DiagramSummary } from '@/types/diagram';

interface DiagramCardProps {
  diagram: DiagramSummary;
}

export const DiagramCard: React.FC<DiagramCardProps> = ({ diagram }) => {
  const { lang, t } = useLanguage();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  if (!diagram.format) {
    console.warn(`Unknown format "${diagram.format}" for diagram ID ${diagram.id}`);
    diagram.format as FileFormat; // Force type for fallback badge
  }
  const formatConfig = FORMAT_BADGE_CONFIG[diagram.format as FileFormat];
  const isPrivileged = user?.role === 'DC' || user?.role === 'ADMIN';
  const thumbnailUrl = `/diagrams/${diagram.id}/versions/${diagram.currentVersionId}/thumbnail`;

  const handleCardClick = useCallback(() => {
    navigate(`/diagrams/${diagram.id}`);
  }, [navigate, diagram.id]);

  const handleDownload = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(
        `/api/diagrams/${diagram.id}/versions/${diagram.currentVersionId}/download`,
        '_blank'
      );
    },
    [diagram.id, diagram.currentVersionId]
  );

  const handleOpen = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/diagrams/${diagram.id}`);
    },
    [navigate, diagram.id]
  );

  const handleMenuAction = useCallback(
    (action: string) => (e: Event) => {
      e.stopPropagation();

      const routes: Record<string, string> = {
        editMetadata: `/diagrams/${diagram.id}/edit`,
        manageAccess: `/diagrams/${diagram.id}/access`,
        uploadRevision: `/diagrams/${diagram.id}/upload-revision`,
      };

      if (routes[action]) {
        navigate(routes[action]);
      }
      // deactivate → trigger modal (TODO)
    },
    [navigate, diagram.id]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick();
      }
    },
    [handleCardClick]
  );

  return (
    <Card
      className={cn(
        'group cursor-pointer overflow-hidden transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-0.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${t('archive.card.open')} ${diagram.title}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {!thumbnailError ? (
          <img
            src={thumbnailUrl}
            alt={diagram.title}
            className="h-full w-full object-cover"
            onError={() => setThumbnailError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1">
            <span className="text-4xl">{formatConfig.icon}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {diagram.format}
            </span>
          </div>
        )}

        {/* Format Badge */}
        <Badge
          className={cn(
            'absolute top-2 end-2 border text-[0.65rem] font-bold uppercase tracking-wide',
            formatConfig.className
          )}
        >
          {diagram.format}
        </Badge>

        {/* Hover Overlay */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center gap-3 bg-black/40 transition-opacity duration-150',
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full bg-white/95 text-foreground shadow-md hover:bg-white hover:scale-110 transition-transform"
            onClick={handleDownload}
            aria-label={t('archive.card.download')}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full bg-white/95 text-foreground shadow-md hover:bg-white hover:scale-110 transition-transform"
            onClick={handleOpen}
            aria-label={t('archive.card.open')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Card Body */}
      <CardContent className="flex flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {diagram.title}
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-violet-100 text-violet-700 text-[0.65rem] font-semibold"
          >
            {diagram.currentVersion.revisionLabel}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDate(diagram.currentVersion.uploadedAt, lang)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {formatFileSize(diagram.currentVersion.fileSize)}
          </span>

          {isPrivileged && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Options"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onSelect={handleMenuAction('editMetadata')}>
                  <Edit className="me-2 h-4 w-4" />
                  {t('archive.card.editMetadata')}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleMenuAction('manageAccess')}>
                  <Shield className="me-2 h-4 w-4" />
                  {t('archive.card.manageAccess')}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleMenuAction('uploadRevision')}>
                  <Upload className="me-2 h-4 w-4" />
                  {t('archive.card.uploadRevision')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={handleMenuAction('deactivate')}
                  className="text-destructive focus:text-destructive"
                >
                  <XCircle className="me-2 h-4 w-4" />
                  {t('archive.card.deactivate')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagramCard;