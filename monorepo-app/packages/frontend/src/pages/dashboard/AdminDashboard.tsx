// src/pages/dashboard/AdminDashboard.tsx
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../../hooks/useLanguage';
import { formatFileSize, timeAgo, formatDate } from '../../utils/format';
import { triggerBackup } from '../../api/dashboard';
import { useSystemHealth, useRecentAuditLogs } from './hooks/useDashboardQueries';
import { KPICard } from './components/KPICard';
import { ProgressBar } from './components/ProgressBar';
import { StatusBadge } from './components/StatusBadge';
import { EmptyState } from './components/EmptyState';
import { SkeletonKPIRow } from './components/SkeletonCard';
import { SkeletonTable } from './components/SkeletonTable';
import type { BackupInfo, ReplicationTarget } from '../../types/dashboard';

type BackupStatus = BackupInfo['status'];
type ReplicationStatus = ReplicationTarget['status'];

const backupStatusVariant: Record<BackupStatus, 'success' | 'error' | 'warning' | 'info'> = {
  SUCCESS: 'success',
  FAILED: 'error',
  RUNNING: 'warning',
  PENDING: 'info',
};

const backupStatusLabel: Record<string, Record<BackupStatus, string>> = {
  ar: {
    SUCCESS: 'ناجح',
    FAILED: 'فشل',
    RUNNING: 'جارٍ',
    PENDING: 'معلق',
  },
  en: {
    SUCCESS: 'Success',
    FAILED: 'Failed',
    RUNNING: 'Running',
    PENDING: 'Pending',
  },
};

const replicationStatusVariant: Record<ReplicationStatus, 'success' | 'error' | 'warning'> = {
  SYNCED: 'success',
  ERROR: 'error',
  PENDING: 'warning',
};

const replicationStatusLabel: Record<string, Record<ReplicationStatus, string>> = {
  ar: {
    SYNCED: 'متزامن',
    ERROR: 'خطأ',
    PENDING: 'معلق',
  },
  en: {
    SYNCED: 'Synced',
    ERROR: 'Error',
    PENDING: 'Pending',
  },
};

export function AdminDashboard() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [backupTriggered, setBackupTriggered] = useState(false);

  const {
    data: health,
    isLoading: healthLoading,
    isError: healthError,
    refetch: refetchHealth,
  } = useSystemHealth();

  const {
    data: auditLogs,
    isLoading: auditLoading,
    isError: auditError,
    refetch: refetchAudit,
  } = useRecentAuditLogs(10);

  const backupMutation = useMutation({
    mutationFn: triggerBackup,
    onSuccess: () => {
      setBackupTriggered(true);
      queryClient.invalidateQueries({ queryKey: ['admin', 'health'] });
      setTimeout(() => setBackupTriggered(false), 5000);
    },
  });

  const handleTriggerBackup = useCallback(() => {
    if (!backupMutation.isPending) {
      backupMutation.mutate();
    }
  }, [backupMutation]);

  const langKey = lang === 'ar' ? 'ar' : 'en';

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.title')}</h1>

      {/* System Health Cards */}
      {healthLoading ? (
        <SkeletonKPIRow count={3} />
      ) : healthError ? (
        <EmptyState
          message={t('common.error')}
          action={{ label: t('common.retry'), onClick: () => refetchHealth() }}
        />
      ) : health ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Storage Used */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">{t('dashboard.storageUsed')}</h3>
            </div>

            <ProgressBar
              value={health.storageUsedBytes}
              max={health.storageTotalBytes}
              valueLabel={`${formatFileSize(health.storageUsedBytes, lang)} / ${formatFileSize(health.storageTotalBytes, lang)}`}
              size="lg"
            />

            <p className="mt-2 text-xs text-gray-400">
              {Math.round((health.storageUsedBytes / health.storageTotalBytes) * 100)}%{' '}
              {lang === 'ar' ? 'مستخدم' : 'used'}
            </p>
          </div>

          {/* Last Backup */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">{t('dashboard.lastBackup')}</h3>
            </div>

            {health.lastBackup ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {health.lastBackup.completedAt
                      ? timeAgo(health.lastBackup.completedAt, lang)
                      : '—'}
                  </span>
                  <StatusBadge
                    label={backupStatusLabel[langKey][health.lastBackup.status]}
                    variant={backupStatusVariant[health.lastBackup.status]}
                    pulse={health.lastBackup.status === 'RUNNING'}
                  />
                </div>

                {health.lastBackup.completedAt && (
                  <p className="text-xs text-gray-400">
                    {formatDate(health.lastBackup.completedAt, lang)}
                  </p>
                )}

                <p className="text-xs text-gray-400">
                  {formatFileSize(health.lastBackup.sizeBytes, lang)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">{t('common.noData')}</p>
            )}
          </div>

          {/* Replication Targets */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">
                {t('admin.replication.title')}
              </h3>
            </div>

            {health.replicationTargets.length > 0 ? (
              <ul className="space-y-3">
                {health.replicationTargets.map((target) => (
                  <li
                    key={target.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{target.label}</p>
                      <p className="text-xs text-gray-400">
                        {target.lastSyncAt
                          ? timeAgo(target.lastSyncAt, lang)
                          : lang === 'ar'
                            ? 'لم تتم المزامنة بعد'
                            : 'Never synced'}
                      </p>
                    </div>
                    <StatusBadge
                      label={replicationStatusLabel[langKey][target.status]}
                      variant={replicationStatusVariant[target.status]}
                      pulse={target.status === 'PENDING'}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">{t('common.noData')}</p>
            )}
          </div>
        </div>
      ) : null}

      {/* Quick Action Buttons */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {t('dashboard.quickActions')}
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleTriggerBackup}
            disabled={backupMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-green-200 bg-green-50 px-5 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            {backupMutation.isPending
              ? t('common.loading')
              : lang === 'ar'
                ? 'نسخة احتياطية الآن'
                : 'Backup Now'}
          </button>

          {backupTriggered && (
            <span className="self-center text-sm text-green-600">
              ✓ {lang === 'ar' ? 'تم بدء النسخ الاحتياطي' : 'Backup started'}
            </span>
          )}

          <button
            onClick={() => navigate('/admin/users')}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            {lang === 'ar' ? 'إضافة مستخدم' : 'Add User'}
          </button>

          <button
            onClick={() => navigate('/admin/audit')}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {lang === 'ar' ? 'سجل الأحداث' : 'Audit Log'}
          </button>
        </div>
      </section>

      {/* Recent Audit Logs Table */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {t('admin.audit.title')}
        </h2>

        {auditLoading && <SkeletonTable rows={10} columns={4} />}

        {auditError && !auditLoading && (
          <EmptyState
            message={t('common.error')}
            action={{ label: t('common.retry'), onClick: () => refetchAudit() }}
          />
        )}

        {!auditLoading && !auditError && auditLogs && auditLogs.length === 0 && (
          <EmptyState message={t('common.noData')} />
        )}

        {!auditLoading && !auditError && auditLogs && auditLogs.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {t('admin.audit.timestamp')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {t('admin.audit.user')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {t('admin.audit.action')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {lang === 'ar' ? 'نوع الهدف' : 'Target Type'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-50 transition-colors hover:bg-gray-50 last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <span
                          className="text-sm text-gray-600"
                          title={formatDate(entry.occurredAt, lang)}
                        >
                          {timeAgo(entry.occurredAt, lang)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {entry.user.username}
                          </span>
                          <p className="text-xs text-gray-400">{entry.user.fullName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono font-medium text-gray-700">
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{entry.targetType}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}