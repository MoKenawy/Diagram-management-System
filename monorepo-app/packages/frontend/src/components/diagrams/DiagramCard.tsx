// src/components/diagrams/DiagramCard.tsx
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Fade,
} from '@mui/material';
import { Download, OpenInNew } from '@mui/icons-material';
import type { DiagramSummaryResponse, Role } from '@/types/index';
import { formatTimeAgo, formatStorageSize } from '@/utils/formatters';
import { useThumbnailUrl } from '@/hooks/useThumbnailUrl';
import { FormatBadge } from './FormatBadge';
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
  const [isHovered, setIsHovered] = useState(false);

  const currentVersion = diagram.currentVersion;
  const thumbnailUrl = useThumbnailUrl(diagram.id, currentVersion?.id);
  const canManage = PRIVILEGED_ROLES.includes(userRole);

  return (
    <Card
      sx={{
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isHovered
          ? '0 8px 24px rgba(0,0,0,0.14)'
          : '0 1px 4px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(diagram.id)}
    >
      {/* Thumbnail */}
      <Box sx={{ position: 'relative', height: 180, overflow: 'hidden' }}>
        {thumbnailUrl ? (
          <CardMedia
            component="img"
            height={180}
            image={thumbnailUrl}
            alt={diagram.title}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            height={180}
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ backgroundColor: '#f0f0f0' }}
          >
            <Typography variant="h3" sx={{ opacity: 0.3 }}>
              📄
            </Typography>
          </Box>
        )}

        {/* Format badge — top left */}
        {currentVersion && (
          <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
            <FormatBadge format={currentVersion.fileFormat} />
          </Box>
        )}

        {/* Hover overlay with actions */}
        <Fade in={isHovered}>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            {currentVersion && (
              <IconButton
                size="small"
                sx={{
                  backgroundColor: 'white',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(diagram.id, currentVersion.id);
                }}
              >
                <Download fontSize="small" />
              </IconButton>
            )}
            <IconButton
              size="small"
              sx={{
                backgroundColor: 'white',
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
              onClick={(e) => {
                e.stopPropagation();
                onClick(diagram.id);
              }}
            >
              <OpenInNew fontSize="small" />
            </IconButton>
          </Box>
        </Fade>
      </Box>

      {/* Content */}
      <CardContent
        sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={0.5}
        >
          <Typography
            variant="subtitle2"
            fontWeight={600}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4,
              flexGrow: 1,
            }}
          >
            {diagram.title}
          </Typography>

          {canManage && (
            <DiagramCardMenu
              onEditMetadata={() => onEditMetadata?.(diagram.id)}
              onManageAccess={() => onManageAccess?.(diagram.id)}
              onUploadRevision={() => onUploadRevision?.(diagram.id)}
              onDeactivate={() => onDeactivate?.(diagram.id)}
            />
          )}
        </Box>

        {/* Revision label */}
        {currentVersion && (
          <Chip
            label={currentVersion.revisionLabel}
            size="small"
            variant="outlined"
            color="secondary"
            sx={{
              borderRadius: 2,
              alignSelf: 'flex-start',
              mb: 1,
              fontSize: 11,
            }}
          />
        )}

        {/* Meta row */}
        <Box
          mt="auto"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="caption" color="text.secondary">
            {currentVersion
              ? formatTimeAgo(currentVersion.uploadedAt)
              : '—'}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {currentVersion
              ? formatStorageSize(currentVersion.fileSizeBytes)
              : '—'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};