// src/components/diagrams/viewers/ImageViewer.tsx
import { useState } from 'react';
import { Box, Modal, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useAuthenticatedBlobUrl } from '@/hooks/useAuthenticatedUrl';
import { CircularProgress } from '@mui/material';
import { getDownloadUrl } from '@/utils/diagramFormatUtils';

interface ImageViewerProps {
  diagramId: string;
  versionId: string;
}

export const ImageViewer = ({ diagramId, versionId }: ImageViewerProps) => {
  const [fullscreen, setFullscreen] = useState(false);
  const fileUrl = getDownloadUrl(diagramId, versionId);
  const { blobUrl, isLoading } = useAuthenticatedBlobUrl(fileUrl);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!blobUrl) {
    return (
      <Box display="flex" justifyContent="center" py={8} color="text.disabled">
        فشل تحميل الصورة
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          maxHeight: 'calc(100vh - 240px)',
          overflow: 'hidden',
          cursor: 'zoom-in',
        }}
        onClick={() => setFullscreen(true)}
      >
        <img
          src={blobUrl}
          alt="Diagram"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </Box>

      <Modal open={fullscreen} onClose={() => setFullscreen(false)}>
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          <IconButton
            onClick={() => setFullscreen(false)}
            sx={{ position: 'absolute', top: 16, right: 16, color: 'white' }}
          >
            <Close />
          </IconButton>
          <img
            src={blobUrl}
            alt="Diagram full"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        </Box>
      </Modal>
    </>
  );
};