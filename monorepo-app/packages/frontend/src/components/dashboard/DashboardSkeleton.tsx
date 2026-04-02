// src/components/dashboard/DashboardSkeleton.tsx
import { Box, Grid, Skeleton, Stack } from '@mui/material';

export const DashboardSkeleton = () => (
  <Box>
    <Skeleton variant="text" width={300} height={48} sx={{ mb: 1 }} />
    <Skeleton variant="text" width={200} height={24} sx={{ mb: 3 }} />

    <Grid container spacing={2} mb={3}>
      {Array.from({ length: 4 }, (_, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
          <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
        </Grid>
      ))}
    </Grid>

    <Stack spacing={2}>
      <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
      <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
    </Stack>
  </Box>
);