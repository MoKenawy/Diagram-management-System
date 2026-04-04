// src/components/diagrams/viewers/DwgPlaceholder.tsx
import { Box, Typography, Button } from '@mui/material';
import { Architecture, Download } from '@mui/icons-material';

interface DwgPlaceholderProps {
  onDownload: () => void;
}

export const DwgPlaceholder = ({ onDownload }: DwgPlaceholderProps) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 10,
      px: 4,
      border: '2px dashed #b0bec5',
      borderRadius: 4,
      backgroundColor: '#eceff1',
    }}
  >
    <Architecture sx={{ fontSize: 80, color: '#546e7a', mb: 2 }} />
    <Typography variant="h5" fontWeight={600} color="text.secondary" gutterBottom>
      ملف AutoCAD
    </Typography>
    <Typography variant="body2" color="text.disabled" mb={3}>
      يتطلب برنامج متخصص للعرض
    </Typography>
    <Button
      variant="contained"
      size="large"
      startIcon={<Download />}
      onClick={onDownload}
      sx={{
        borderRadius: 3,
        textTransform: 'none',
        fontWeight: 600,
        px: 4,
      }}
    >
      تحميل الملف
    </Button>
  </Box>
);