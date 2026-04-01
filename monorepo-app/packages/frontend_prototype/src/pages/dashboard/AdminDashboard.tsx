import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HardDrive,
  Database,
  Server,
  UserPlus,
  ScrollText,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import {
  fetchReportSummary,
  fetchBackups,
  fetchReplicationTargets,
  fetchAuditLogs,
  triggerBackup,
} from '../../api/client';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { CardSkeleton, TableSkeleton } from '../../components/ui/Skeleton';
import { formatFileSize, timeAgo } from '../../utils/format';
import type { BackupStatus, SyncStatus } from '../../types';

const REFETCH_INTERVAL = 30_000; // 30 seconds for health data
const MAX_STORAGE_BYTES = 10 * 1024 * 1024 * 1024; // 10GB assumed max

function backupStatusVariant(status: BackupStatus) {
  switch (status) {
    case 'SUCCESS':
      return 'success' as const;
    case 'FAILED':
      return 'danger' as const;
    case 'RUNNING':
      return 'warning' as const;
  }
}

function syncStatusVariant(status: SyncStatus) {
  switch (status) {
    case 'SUCCESS':
      return 'success' as const;
    case 'FAILED':
      return 'danger' as const;
    case 'NEVER':
      return 'neutral' as const;
  }
}

export function AdminDashboard() {
  const { t, lang, setLanguage } = useLanguage();
  
  if (!lang) {
      setLanguage(lang); // Ensure lang is set correctly for formatting
  }
  const queryClient = useQueryClient();

  // ─── Queries with refetchInterval ───────────────────────────
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['reports', 'summary', 'admin'],
    queryFn: () => fetchReportSummary(),
    refetchInterval: REFETCH_INTERVAL,
  });

  const { data: backups, isLoading: backupsLoading } = useQuery({
    queryKey: ['admin', 'backups'],
    queryFn: fetchBackups,
    refetchInterval: REFETCH_INTERVAL,
  });

  const { data: replTargets, isLoading: replLoading } = useQuery({
    queryKey: ['admin', 'replication'],
    queryFn: fetchReplicationTargets,
    refetchInterval: REFETCH_INTERVAL,
  });

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['admin', 'audit-logs', 'recent'],
    queryFn: () => fetchAuditLogs({ limit: 10, page: 1 }),
    refetchInterval: REFETCH_INTERVAL,
  });

  const backupMutation = useMutation({
    mutationFn: triggerBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'backups'] });
    },
  });

  const auditEntries = auditData?.data ?? [];
  const storageUsed = parseInt(summary?.storageUsedBytes ?? '0', 10);
  const storagePercent = Math.round((storageUsed / MAX_STORAGE_BYTES) * 100);

  // Last backup
  const lastBackup = backups?.length
    ? [...backups].sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      )[0]
    : null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">{t('systemHealth')}</h1>

      {/* ─── Health cards ───────────────────────────────────────── */}
      {summaryLoading || backupsLoading || replLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Storage */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
              <HardDrive className="h-4 w-4" />
              {t('storageUsed')}
            </div>
            <p className="mb-3 text-2xl font-bold text-slate-900">
              {formatFileSize(summary?.storageUsedBytes ?? '0')}
            </p>
            <ProgressBar value={storagePercent} />
            <p className="mt-2 text-xs text-slate-400">
              {storagePercent}% {lang === 'ar' ? 'مستخدم' : 'used'}
            </p>
          </div>

          {/* Last Backup */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
              <Database className="h-4 w-4" />
              {t('lastBackup')}
            </div>
            {lastBackup ? (
              <>
                <p className="mb-2 text-lg font-semibold text-slate-900">
                  {timeAgo(lastBackup.startedAt, lang as 'ar' | 'en' )}
                </p>
                <StatusBadge
                  label={t(lastBackup.status.toLowerCase())}
                  variant={backupStatusVariant(lastBackup.status)}
                />
              </>
            ) : (
              <p className="text-sm text-slate-400">{t('noData')}</p>
            )}
          </div>

          {/* Replication Targets */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
              <Server className="h-4 w-4" />
              {t('replicationTargets')}
            </div>
            {replTargets && replTargets.length > 0 ? (
              <div className="space-y-3">
                {replTargets.map((target) => (
                  <div
                    key={target.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700">{target.label}</p>
                      <p className="text-xs text-slate-400">
                        {t('lastSync')}:{' '}
                        {target.lastSyncAt ? timeAgo(target.lastSyncAt, lang as 'ar' | 'en' ) : t('never')}
                      </p>
                    </div>
                    <StatusBadge
                      label={t(target.lastSyncStatus.toLowerCase())}
                      variant={syncStatusVariant(target.lastSyncStatus)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">{t('noData')}</p>
            )}
          </div>
        </div>
      )}

      {/* ─── Quick actions ──────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('quickActions')}</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => backupMutation.mutate()}
            disabled={backupMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-50"
          >
            {backupMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            {t('backupNow')}
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100">
            <UserPlus className="h-4 w-4" />
            {t('addUser')}
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100">
            <ScrollText className="h-4 w-4" />
            {t('auditLog')}
          </button>
        </div>
      </section>

      {/* ─── Recent audit table ─────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('recentAudit')}</h2>

        {auditLoading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-start font-medium text-slate-600">
                      {t('time')}
                    </th>
                    <th className="px-4 py-3 text-start font-medium text-slate-600">
                      {t('user')}
                    </th>
                    <th className="px-4 py-3 text-start font-medium text-slate-600">
                      {t('action')}
                    </th>
                    <th className="px-4 py-3 text-start font-medium text-slate-600">
                      {t('target')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {auditEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {timeAgo(entry.occurredAt, lang as 'ar' | 'en' )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {entry.user?.username ?? (lang === 'ar' ? 'النظام' : 'System')}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={entry.action}
                          variant={
                            entry.action.includes('DELETED') || entry.action.includes('FAILED')
                              ? 'danger'
                              : entry.action.includes('CREATED') ||
                                  entry.action.includes('UPLOADED')
                                ? 'success'
                                : 'info'
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {entry.targetType ?? '-'}
                      </td>
                    </tr>
                  ))}

                  {auditEntries.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        {t('noData')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
