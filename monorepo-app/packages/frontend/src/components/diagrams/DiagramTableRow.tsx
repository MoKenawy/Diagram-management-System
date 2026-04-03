// src/components/diagrams/DiagramTableRow.tsx
import {
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { FormatBadge } from './FormatBadge';
import { DiagramCardMenu } from './DiagramCardMenu';
import { DiagramThumbnailAvatar } from './DiagramThumbnailAvatar';
import { formatTimeAgo } from '@/utils/formatters';
import type { DiagramSummaryResponse } from '@/types/index';

interface DiagramTableRowProps {
  diagram: DiagramSummaryResponse;
  canManage: boolean;
  onRowClick: (id: string) => void;
  onDownload: (diagramId: string, versionId: string) => void;
  onEditMetadata?: (id: string) => void;
  onManageAccess?: (id: string) => void;
  onUploadRevision?: (id: string) => void;
  onDeactivate?: (id: string) => void;
}

export const DiagramTableRow = ({
  diagram,
  canManage,
  onRowClick,
  onDownload,
  onEditMetadata,
  onManageAccess,
  onUploadRevision,
  onDeactivate,
}: DiagramTableRowProps) => {
  const cv = diagram.currentVersion;

  return (
    <TableRow
      hover
      sx={{ cursor: 'pointer' }}
      onClick={() => onRowClick(diagram.id)}
    >
      <TableCell align="right">
        <DiagramThumbnailAvatar
          diagramId={diagram.id}
          versionId={cv?.id}
        />
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 200 }}>
          {diagram.title}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="caption" color="secondary">
          {cv?.revisionLabel ?? '—'}
        </Typography>
      </TableCell>
      <TableCell align="right">
        {cv && <FormatBadge format={cv.fileFormat} />}
      </TableCell>
      <TableCell align="right">{diagram.department.nameAr}</TableCell>
      <TableCell align="right">{cv?.uploadedBy.fullName ?? '—'}</TableCell>
      <TableCell align="right">
        {cv ? formatTimeAgo(cv.uploadedAt) : '—'}
      </TableCell>
      <TableCell align="right">
        <Box
          display="flex"
          alignItems="center"
          gap={0.5}
          onClick={(e) => e.stopPropagation()}
        >
          {cv && (
            <IconButton
              size="small"
              onClick={() => onDownload(diagram.id, cv.id)}
            >
              <Download fontSize="small" />
            </IconButton>
          )}
          {canManage && (
            <DiagramCardMenu
              onEditMetadata={() => onEditMetadata?.(diagram.id)}
              onManageAccess={() => onManageAccess?.(diagram.id)}
              onUploadRevision={() => onUploadRevision?.(diagram.id)}
              onDeactivate={() => onDeactivate?.(diagram.id)}
            />
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
};