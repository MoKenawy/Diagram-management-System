// src/components/dashboard/admin/StorageHealthCard.tsx
import { Card, CardContent, Typography, LinearProgress, Box, Skeleton } from '@mui/material';
import { formatStorageSize } from '@/utils/formatters';

interface StorageHealthCardProps {
  usedBytes: string;
  isLoading: boolean;
}

const MAX_STORAGE_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB assumed max

export const StorageHealthCard = ({ usedBytes, isLoading }: StorageHealthCardProps) => {
  const used = parseInt(usedBytes || '0', 10);
  const percentage = Math.min((used / MAX_STORAGE_BYTES) * 100, 100);

  const barColor = percentage > 90 ? 'error' : percentage > 70 ? 'warning' : 'success';

  return (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          المساحة المستخدمة
        </Typography>
        {isLoading ? (
          <Skeleton height={60} />
        ) : (
          <>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {formatStorageSize(usedBytes)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={percentage}
              color={barColor}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Box display="flex" justifyContent="space-between" mt={0.5}>
              <Typography variant="caption" color="text.disabled">
                {percentage.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {formatStorageSize(MAX_STORAGE_BYTES)}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};