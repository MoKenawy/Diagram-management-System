import { Box, Typography, Button, Card, CardContent, CardActions, Chip, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Add, Sync, Edit, Delete, CheckCircle, ErrorOutline, Schedule } from '@mui/icons-material';
import { useReplicationTargets, useSyncReplication, useDeleteReplication } from '@/hooks/queries/useAdminQueries';

export const AdminReplicationPage = () => {
  // Uses your hook's refetchInterval pattern (30 seconds)
  const { data: targets = [] } = useReplicationTargets(30000); 
  const syncMutation = useSyncReplication();
  const deleteMutation = useDeleteReplication();

  const getStatusColor = (status: string) => {
    if (status === 'SUCCESS') return 'success';
    if (status === 'FAILED') return 'error';
    return 'default';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={4}>
        <Typography variant="h5">النسخ المتزامن (Replication)</Typography>
        <Button variant="contained" startIcon={<Add />}>إضافة هدف</Button>
      </Box>

      <Grid container spacing={3}>
        {targets.map((target: any) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={target.id}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6">{target.label}</Typography>
                  <Chip 
                    size="small" label={target.lastSyncStatus} color={getStatusColor(target.lastSyncStatus)}
                    icon={target.lastSyncStatus === 'SUCCESS' ? <CheckCircle /> : <ErrorOutline />} 
                  />
                </Box>
                <Typography variant="body2" color="textSecondary" mb={1}>الخادم: {target.host}:{target.port}</Typography>
                <Typography variant="body2" color="textSecondary" mb={2}>المستخدم: {target.sshUsername}</Typography>
                <Typography variant="caption" color="textSecondary" display="flex" alignItems="center" gap={0.5}>
                  <Schedule fontSize="small" /> آخر مزامنة: {target.lastSyncAt ? new Date(target.lastSyncAt).toLocaleString('ar') : 'لم تتم أبدًا'}
                </Typography>
              </CardContent>
              <CardActions sx={{ bgcolor: 'action.hover', justifyContent: 'space-between' }}>
                <Button 
                  size="small" startIcon={<Sync />} 
                  onClick={() => syncMutation.mutate(target.id)}
                  disabled={syncMutation.isPending}
                >
                  مزامنة الآن
                </Button>
                <Box>
                  <IconButton size="small"><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(target.id)}><Delete fontSize="small" /></IconButton>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};