// src/components/diagrams/ArchiveEmptyState.tsx
import { Box, Typography, Button } from '@mui/material';
import { SearchOff } from '@mui/icons-material';

interface ArchiveEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export const ArchiveEmptyState = ({ hasFilters, onClearFilters }: ArchiveEmptyStateProps) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    py={10}
  >
    <SearchOff sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
    <Typography variant="h6" color="text.secondary" gutterBottom>
      لا توجد نتائج
    </Typography>
    <Typography variant="body2" color="text.disabled" mb={2}>
      {hasFilters
        ? 'جرّب تغيير معايير البحث أو مسح الفلاتر'
        : 'لم يتم رفع أي لوحات بعد'}
    </Typography>
    {hasFilters && (
      <Button
        variant="outlined"
        onClick={onClearFilters}
        sx={{ borderRadius: 3, textTransform: 'none' }}
      >
        مسح الفلاتر
      </Button>
    )}
  </Box>
);