// src/pages/dashboard/AdminDashboard.tsx
import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Box, Grid } from '@mui/material';
import { useReportSummary } from '@/hooks/queries/useReportQueries';
import {
  useAuditLogs,
  useBackups,
  useReplicationTargets,
  useTriggerBackup,
} from '@/hooks/queries/useAdminQueries';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { StorageHealthCard } from '@/components/dashboard/admin/StorageHealthCard';
import { LastBackupCard } from '@/components/dashboard/admin/LastBackupCard';
import { ReplicationTargetsCard } from '@/components/dashboard/admin/ReplicationTargetsCard';
import { AdminQuickActions } from '@/components/dashboard/admin/AdminQuickActions';
import { RecentAuditTable } from '@/components/dashboard/admin/RecentAuditTable';
import { AdminLayout } from '@/pages/admin/AdminLayout';

const ADMIN_REFETCH_INTERVAL = 30_000;

export const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: summary, isLoading: summaryLoading } = useReportSummary();

  const { data: backups, isLoading: backupsLoading } = useBackups(ADMIN_REFETCH_INTERVAL);

  const { data: targets, isLoading: targetsLoading } = useReplicationTargets(
    ADMIN_REFETCH_INTERVAL
  );

  const { data: auditLogs, isLoading: auditLoading } = useAuditLogs({
    limit: 10,
  });

  const { mutate: triggerBackup, isPending: isBackupPending } = useTriggerBackup();

  const handleAddUser = useCallback(() => {
    navigate({ to: '/admin/users' });
  }, [navigate]);

  const handleViewAuditLogs = useCallback(() => {
    navigate({ to: '/admin/audit' });
  }, [navigate]);

  const lastBackup = backups?.[0];

  return (
    <AdminLayout>
    <Box>
      <SectionHeader title="لوحة إدارة النظام" />

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StorageHealthCard
            usedBytes={summary?.storageUsedBytes ?? '0'}
            isLoading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <LastBackupCard backup={lastBackup} isLoading={backupsLoading} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ReplicationTargetsCard targets={targets ?? []} isLoading={targetsLoading} />
        </Grid>
      </Grid>

      <AdminQuickActions
        onBackup={() => triggerBackup()}
        onAddUser={handleAddUser}
        onViewAuditLogs={handleViewAuditLogs}
        isBackupPending={isBackupPending}
      />

      <RecentAuditTable entries={auditLogs?.data ?? []} isLoading={auditLoading} />
    </Box>
    </AdminLayout>
  );
};