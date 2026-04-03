// src/components/diagrams/ArchivePageSkeleton.tsx
import { Box, Grid, Skeleton, Stack } from '@mui/material';
import { DiagramCardSkeleton } from './DiagramCardSkeleton';

export const ArchivePageSkeleton = () => (
  <Box dir="rtl" sx={{ p: 4 }}>
    <Skeleton width={300} height={40} sx={{ mb: 2 }} />
    <Box display="flex" gap={3}>
      <Skeleton
        variant="rounded"
        width={280}
        height={400}
        sx={{ borderRadius: 3, display: { xs: 'none', md: 'block' } }}
      />
      <Box flex={1}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Skeleton width={200} height={36} sx={{ borderRadius: 3 }} />
          <Skeleton width={80} height={36} />
        </Stack>
        <Grid container spacing={2}>
          {Array.from({ length: 12 }, (_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <DiagramCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  </Box>
);