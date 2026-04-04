// src/components/diagrams/VersionHistoryPanel.tsx
import {
  Box,
  List,
  ListItem,
  Typography,
  Chip,
  IconButton,
  Skeleton,
  Divider,
  Stack,
} from '@mui/material';
import { Download, Visibility } from '@mui/icons-material';
import { useDiagramVersions } from '@/hooks/queries/useDiagramDetailQueries';
import { useDiagramDownload } from '@/hooks/useDiagramDownload';
import { formatTimeAgo, formatStorageSize } from '@/utils/formatters';
import type { DiagramVersionResponse } from '@/types/index';

interface VersionHistoryPanelProps {
  diagramId: string;
  currentVersionId: string | null;
  selectedVersionId: string;
  onVersionSelect: (version: DiagramVersionResponse) => void;
}

const SKELETON_COUNT = 3;

export const VersionHistoryPanel = ({
  diagramId,
  currentVersionId,
  selectedVersionId,
  onVersionSelect,
}: VersionHistoryPanelProps) => {
  const { data: versions, isLoading } = useDiagramVersions(diagramId);
  const { download } = useDiagramDownload();

  if (isLoading) {
    return (
      <Box>
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <Box key={i} sx={{ p: 2, mb: 1 }}>
            <Skeleton width="60%" height={24} />
            <Skeleton width="40%" height={18} sx={{ mt: 0.5 }} />
            <Skeleton width="80%" height={16} sx={{ mt: 0.5 }} />
          </Box>
        ))}
      </Box>
    );
  }

  const sorted: DiagramVersionResponse[] = [...(versions ?? [])].sort(
    (a, b) => b.versionNumber - a.versionNumber
  );

  return (
    <List disablePadding>
      {sorted.map((version, index) => {
        const isCurrent: boolean = version.id === currentVersionId;
        const isSelected: boolean = version.id === selectedVersionId;

        return (
          <Box key={version.id}>
            {index > 0 && <Divider />}
            <ListItem
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                p: 2,
                backgroundColor: isSelected ? '#e8f5e9' : 'transparent',
                borderRight: isSelected ? '3px solid #2e7d32' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {/* Header row */}
              <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={`الإصدار ${version.versionNumber}`}
                    size="small"
                    color={isCurrent ? 'success' : 'default'}
                    variant={isCurrent ? 'filled' : 'outlined'}
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  />
                  <Chip
                    label={version.revisionLabel}
                    size="small"
                    variant="outlined"
                    color="secondary"
                    sx={{ borderRadius: 2, fontSize: 11 }}
                  />
                  {isCurrent && (
                    <Chip
                      label="الإصدار الحالي"
                      size="small"
                      color="success"
                      sx={{ borderRadius: 2, fontSize: 11 }}
                    />
                  )}
                </Stack>

                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={() => onVersionSelect(version)}
                    disabled={isSelected}
                    title="عرض"
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => download(diagramId, version.id)}
                    title="تحميل"
                  >
                    <Download fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>

              {/* Change summary */}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {version.changeSummary}
              </Typography>

              {/* Meta */}
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.disabled">
                  {version.uploadedBy.fullName}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {formatTimeAgo(version.uploadedAt)}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {formatStorageSize(version.fileSizeBytes)}
                </Typography>
              </Stack>
            </ListItem>
          </Box>
        );
      })}
    </List>
  );
};