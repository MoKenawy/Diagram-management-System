// src/components/diagrams/DiagramCardSkeleton.tsx
import { Card, CardContent, Skeleton, Box } from '@mui/material';

export const DiagramCardSkeleton = () => (
  <Card sx={{ borderRadius: 3, height: '100%' }}>
    <Skeleton variant="rectangular" height={180} />
    <CardContent sx={{ p: 2 }}>
      <Skeleton width="80%" height={20} />
      <Skeleton width="50%" height={20} sx={{ mt: 0.5 }} />
      <Skeleton width={60} height={22} sx={{ mt: 1, borderRadius: 2 }} />
      <Box display="flex" justifyContent="space-between" mt={1.5}>
        <Skeleton width={70} height={14} />
        <Skeleton width={50} height={14} />
      </Box>
    </CardContent>
  </Card>
);