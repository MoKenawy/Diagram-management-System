// src/components/diagrams/DiagramPageHeader.tsx
import { Box, Typography, IconButton, Button, Stack, Chip } from '@mui/material';
import { ArrowForward, Download, Print } from '@mui/icons-material';
import { FormatBadge } from '@/components/diagrams/FormatBadge';
import { formatTimeAgo } from '@/utils/formatters';
import { useDiagramDownload } from '@/hooks/useDiagramDownload';
import type { DiagramDetailResponse } from '@/types/index';

interface DiagramPageHeaderProps {
  diagram: DiagramDetailResponse;
  onBack: () => void;
}

export const DiagramPageHeader = ({ diagram, onBack }: DiagramPageHeaderProps) => {
  const { download } = useDiagramDownload();
  const cv = diagram.currentVersion;

  const handleDownload = (): void => {
    if (cv) download(diagram.id, cv.id);
  };

  const handlePrint = (): void => {
    window.print();
  };
  

  return (
    <Box className="no-print" sx={{ mb: 3 }}>
      {/* Back */}
      <Button
        startIcon={<ArrowForward />}
        onClick={onBack}
        sx={{ mb: 2, textTransform: 'none', borderRadius: 2, color: 'text.secondary' }}
      >
        رجوع
      </Button>

      {/* Title row */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {diagram.title}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip
              label={diagram.department.nameAr}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
            {cv && (
              <>
                <Chip
                  label={cv.revisionLabel}
                  size="small"
                  variant="outlined"
                  color="secondary"
                  sx={{ borderRadius: 2 }}
                />
                <FormatBadge format={cv.fileFormat} />
              </>
            )}
            {cv && (
              <Typography variant="caption" color="text.disabled">
                {cv.uploadedBy.fullName} · {formatTimeAgo(cv.uploadedAt)}
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={1}>


          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleDownload}
            disabled={!cv}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(90deg, #0059bb, #2455bf)',
            }}
          >
            تحميل
          </Button>
          <IconButton onClick={handlePrint} title="طباعة">
            <Print />
          </IconButton>
        </Stack>


      </Box>
    </Box>
  );
};