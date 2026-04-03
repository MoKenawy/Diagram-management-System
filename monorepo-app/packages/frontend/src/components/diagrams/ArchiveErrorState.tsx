// src/components/diagrams/ArchiveErrorState.tsx
import { Box, Typography, Button } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

interface ArchiveErrorStateProps {
  onRetry: () => void;
}

export const ArchiveErrorState = ({ onRetry }: ArchiveErrorStateProps) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    py={10}
  >
    <ErrorOutline sx={{ fontSize: 80, color: 'error.light', mb: 2 }} />
    <Typography variant="h6" color="text.secondary" gutterBottom>
      حدث خطأ أثناء تحميل البيانات
    </Typography>
    <Typography variant="body2" color="text.disabled" mb={2}>
      تأكد من اتصالك بالشبكة وحاول مرة أخرى
    </Typography>
    <Button
      variant="contained"
      onClick={onRetry}
      sx={{ borderRadius: 3, textTransform: 'none' }}
    >
      إعادة المحاولة
    </Button>
  </Box>
);