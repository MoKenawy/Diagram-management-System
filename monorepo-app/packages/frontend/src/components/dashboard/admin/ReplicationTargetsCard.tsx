// src/components/dashboard/admin/ReplicationTargetsCard.tsx
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Box,
} from '@mui/material';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatTimeAgo } from '@/utils/formatters';
import type { ReplicationTargetResponse } from '@/types/index';

interface ReplicationTargetsCardProps {
  targets: ReplicationTargetResponse[];
  isLoading: boolean;
}

export const ReplicationTargetsCard = ({ targets, isLoading }: ReplicationTargetsCardProps) => (
  <Card sx={{ borderRadius: 3, height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        أهداف النسخ المتماثل
      </Typography>
      {isLoading ? (
        Array.from({ length: 2 }, (_, i) => <Skeleton key={i} height={48} sx={{ mb: 1 }} />)
      ) : targets.length === 0 ? (
        <Typography color="text.disabled">لا توجد أهداف</Typography>
      ) : (
        <List disablePadding>
          {targets.map((target) => (
            <ListItem key={target.id} disablePadding sx={{ mb: 1 }}>
              <ListItemText
                primary={target.label}
                secondary={
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <StatusBadge status={target.lastSyncStatus} />
                    <Typography variant="caption" color="text.disabled">
                      {target.lastSyncAt
                        ? formatTimeAgo(target.lastSyncAt)
                        : 'لم يتم المزامنة بعد'}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </CardContent>
  </Card>
);