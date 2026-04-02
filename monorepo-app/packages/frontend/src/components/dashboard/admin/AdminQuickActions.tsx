// src/components/dashboard/admin/AdminQuickActions.tsx
import { Stack, Button } from '@mui/material';
import { Backup, PersonAdd, Receipt } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';

interface AdminQuickActionsProps {
  onBackup: () => void;
  onAddUser: () => void;
  onViewAuditLogs: () => void;
  isBackupPending: boolean;
}

export const AdminQuickActions = ({
  onBackup,
  onAddUser,
  onViewAuditLogs,
  isBackupPending,
}: AdminQuickActionsProps) => (
  <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
    <Button
      variant="contained"
      startIcon={isBackupPending ? <CircularProgress size={18} /> : <Backup />}
      disabled={isBackupPending}
      onClick={onBackup}
      sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
    >
      نسخة احتياطية الآن
    </Button>
    <Button
      variant="outlined"
      startIcon={<PersonAdd />}
      onClick={onAddUser}
      sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
    >
      إضافة مستخدم
    </Button>
    <Button
      variant="outlined"
      startIcon={<Receipt />}
      onClick={onViewAuditLogs}
      sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
    >
      سجل الأحداث
    </Button>
  </Stack>
);