import { useState } from 'react';
import { 
  Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { Backup as BackupIcon, SettingsBackupRestore, Autorenew, CheckCircle, Error } from '@mui/icons-material';
import { useBackups, useTriggerBackup, useRestoreBackup } from '@/hooks/queries/useAdminQueries';

export const AdminBackupsPage = () => {
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [hasRunning, setHasRunning] = useState(false);

  // Uses your hook's refetchInterval pattern
  const { data: backups = [] } = useBackups(hasRunning ? 10000 : undefined);
  
  if (backups.some((b: any) => b.status === 'RUNNING') !== hasRunning) {
    setHasRunning(backups.some((b: any) => b.status === 'RUNNING'));
  }

  const triggerMutation = useTriggerBackup();
  const restoreMutation = useRestoreBackup();

  const handleRestore = async () => {
    if (restoreId && confirmText === 'RESTORE') {
      await restoreMutation.mutateAsync(restoreId);
      setRestoreId(null);
      setConfirmText('');
      alert('بدأت عملية الاستعادة');
    }
  };

  const getStatusChip = (status: string) => {
    switch(status) {
      case 'SUCCESS': return <Chip size="small" color="success" icon={<CheckCircle />} label="ناجح" />;
      case 'FAILED': return <Chip size="small" color="error" icon={<Error />} label="فشل" />;
      case 'RUNNING': return <Chip size="small" color="info" icon={<Autorenew sx={{ animation: 'spin 2s linear infinite' }} />} label="جاري" />;
      default: return <Chip size="small" label={status} />;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5">النسخ الاحتياطي</Typography>
        <Button 
          variant="contained" startIcon={<BackupIcon />} 
          onClick={() => confirm('تأكيد إنشاء نسخة احتياطية؟') && triggerMutation.mutate()}
          disabled={hasRunning || triggerMutation.isPending}
        >
          نسخة احتياطية الآن
        </Button>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>تاريخ البدء</TableCell>
            <TableCell>الحجم</TableCell>
            <TableCell>الحالة</TableCell>
            <TableCell>بواسطة</TableCell>
            <TableCell align="center">إجراء</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {backups.map((b: any) => (
            <TableRow key={b.id}>
              <TableCell>{new Date(b.startedAt).toLocaleString('ar-EG')}</TableCell>
              <TableCell>{(parseInt(b.sizeBytes) / 1024 / 1024).toFixed(2)} MB</TableCell>
              <TableCell>{getStatusChip(b.status)}</TableCell>
              <TableCell>{b.triggeredBy?.fullName || 'النظام'}</TableCell>
              <TableCell align="center">
                <Button 
                  size="small" variant="outlined" color="warning" startIcon={<SettingsBackupRestore />}
                  disabled={b.status !== 'SUCCESS'} onClick={() => setRestoreId(b.id)}
                >
                  استعادة
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!restoreId} onClose={() => setRestoreId(null)}>
        <DialogTitle color="error">تحذير استعادة النظام</DialogTitle>
        <DialogContent>
          <Typography mb={2}>سيؤدي هذا إلى استبدال قاعدة البيانات الحالية. للتاكيد، اكتب "RESTORE":</Typography>
          <TextField fullWidth size="small" value={confirmText} onChange={e => setConfirmText(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreId(null)}>إلغاء</Button>
          <Button color="error" variant="contained" disabled={confirmText !== 'RESTORE' || restoreMutation.isPending} onClick={handleRestore}>
            تأكيد الاستعادة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};