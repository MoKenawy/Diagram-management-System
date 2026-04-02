// src/components/shared/StatusBadge.tsx
import { Chip } from '@mui/material';
import type { BackupStatus, SyncStatus } from '@/types/index';

type BadgeStatus = BackupStatus | SyncStatus;

const STATUS_CONFIG: Record<BadgeStatus, { label: string; color: 'success' | 'error' | 'warning' | 'default' }> = {
  SUCCESS: { label: 'ناجح', color: 'success' },
  FAILED: { label: 'فشل', color: 'error' },
  RUNNING: { label: 'جاري', color: 'warning' },
  NEVER: { label: 'لم يتم', color: 'default' },
};

interface StatusBadgeProps {
  status: BadgeStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status];

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 600, borderRadius: 2 }}
    />
  );
};