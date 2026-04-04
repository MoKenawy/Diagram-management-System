// src/components/diagrams/viewers/SvgViewer.tsx
import { useState, useEffect, useCallback } from 'react';
import { Box, CircularProgress, Button, Typography } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import DOMPurify from 'dompurify';
import { api } from '@/services/api/authService';
import { getDownloadUrl } from '@/utils/diagramFormatUtils';

interface SvgViewerProps {
  diagramId: string;
  versionId: string;
}

export const SvgViewer = ({ diagramId, versionId }: SvgViewerProps) => {
  const [svgHtml, setSvgHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fileUrl = getDownloadUrl(diagramId, versionId);

  const loadSvg = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(false);
    try {
      const response = await api.get<string>(fileUrl, { responseType: 'text' });
      const sanitized: string = DOMPurify.sanitize(response.data, {
        USE_PROFILES: { svg: true },
      });
      setSvgHtml(sanitized);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [fileUrl]);

  useEffect(() => {
    loadSvg();
  }, [loadSvg]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !svgHtml) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" py={8}>
        <Typography color="error" gutterBottom>فشل تحميل ملف SVG</Typography>
        <Button startIcon={<Refresh />} onClick={loadSvg} variant="outlined" sx={{ borderRadius: 2 }}>
          إعادة المحاولة
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxHeight: 'calc(100vh - 240px)',
        overflow: 'auto',
        '& svg': {
          width: '100%',
          height: 'auto',
          maxHeight: '100%',
        },
      }}
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
};