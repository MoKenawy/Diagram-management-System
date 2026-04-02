// src/components/dashboard/admin/LastBackupCard.tsx
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatTimeAgo } from '@/utils/formatters';
import type { BackupRecordResponse } from '@/types/index';

interface LastBackupCardProps {
  backup: BackupRecordResponse | undefined;
  isLoading: boolean;
}

export const LastBackupCard = ({ backup, isLoading }: LastBackupCardProps) => (
  <Card sx={{ borderRadius: 3, height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        آخر نسخة احتياطية
      </Typography>
      {isLoading ? (
        <Skeleton height={60} />
      ) : backup ? (
        <>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {formatTimeAgo(backup.startedAt)}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <StatusBadge status={backup.status} />
            {backup.triggeredBy && (
              <Typography variant="caption" color="text.disabled">
                بواسطة {backup.triggeredBy.fullName}
              </Typography>
            )}
          </Box>
        </>
      ) : (
        <Typography color="text.disabled">لا توجد نسخ احتياطية</Typography>
      )}
    </CardContent>
  </Card>
);