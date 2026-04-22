import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useReportSummary } from '@/hooks/queries/useReportQueries';
import {
  useAuditLogs,
  useBackups,
  useReplicationTargets,
  useTriggerBackup,
} from '@/hooks/queries/useAdminQueries';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { formatStorageSize } from '@/utils/formatters';

const ADMIN_REFETCH_INTERVAL = 30_000;
const MAX_STORAGE_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB

export const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: summary, isLoading: summaryLoading } = useReportSummary();
  const { data: backups, isLoading: backupsLoading } = useBackups(ADMIN_REFETCH_INTERVAL);
  const { data: targets, isLoading: targetsLoading } = useReplicationTargets(ADMIN_REFETCH_INTERVAL);
  const { data: auditLogs, isLoading: auditLoading } = useAuditLogs({ limit: 10 });
  const { mutate: triggerBackup, isPending: isBackupPending } = useTriggerBackup();

  const lastBackup = backups?.[0];

  const storageUsed = parseInt(summary?.storageUsedBytes || '0', 10);
  const storagePercentage = Math.min((storageUsed / MAX_STORAGE_BYTES) * 100, 100);

  const handleAddUser = useCallback(() => {
    navigate({ to: '/admin/users' });
  }, [navigate]);

  return (
    <AdminLayout>
      <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12">
        {/* Page Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-[2.75rem] font-headline font-black text-on-surface tracking-tight leading-none mb-2">نظرة عامة على الأنظمة</h1>
            <p className="text-sm font-label text-on-surface-variant uppercase tracking-widest">واجهة منظور متعددة الأدوار</p>
          </div>
          <div className="text-left">
            <span className="text-xs font-label text-on-surface-variant block">آخر مزامنة</span>
            <span className="text-sm font-body text-on-surface font-medium" dir="ltr">
              {new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' })} UTC
            </span>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {/* Card 1: System Overview (Spans 2 cols) */}
          <div className="col-span-1 md:col-span-2 bg-surface-container-lowest rounded-xl p-6 relative overflow-hidden group hover:bg-surface-container-highest transition-colors duration-300">
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="material-symbols-outlined text-primary text-sm">monitoring</span>
                <h2 className="text-sm font-label uppercase tracking-widest text-on-surface-variant">مؤشرات الأداء الرئيسية</h2>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 relative z-10">
              <div className="flex flex-col">
                <span className="text-[2.5rem] font-headline font-light text-on-surface leading-none mb-1">
                  {summaryLoading ? '-' : summary?.totalActiveDiagrams || 0}
                </span>
                <span className="text-xs font-label text-on-surface-variant">إجمالي المخططات</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[2.5rem] font-headline font-light text-on-surface leading-none mb-1 text-tertiary">
                  {targetsLoading ? '-' : targets?.length || 0}
                </span>
                <span className="text-xs font-label text-on-surface-variant">أهداف المزامنة</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[2.5rem] font-headline font-light text-on-surface leading-none mb-1">
                  {summaryLoading ? '-' : summary?.activeUsersThisMonth || 0}
                </span>
                <span className="text-xs font-label text-on-surface-variant">المستخدمين النشطين</span>
              </div>
            </div>
            {/* Abstract Chart Graphic */}
            <div className="absolute bottom-0 right-0 w-full h-24 opacity-10 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,68,113,0.5) 0%, transparent 100%)' }}>
              <svg className="w-full h-full text-primary fill-current" preserveAspectRatio="none" viewBox="0 0 100 20">
                <path d="M0,20 L0,15 L10,12 L20,18 L30,8 L40,14 L50,5 L60,10 L70,2 L80,8 L90,4 L100,0 L100,20 Z" />
              </svg>
            </div>
          </div>

          {/* Card 2: Quick Actions */}
          <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-between hover:bg-surface-container-highest transition-colors duration-300">
            <div>
              <div className="flex items-center space-x-2 space-x-reverse mb-6">
                <span className="material-symbols-outlined text-primary text-sm">bolt</span>
                <h2 className="text-sm font-label uppercase tracking-widest text-on-surface-variant">إجراءات سريعة</h2>
              </div>
              <div className="mb-4">
                <span className="text-[2.5rem] font-headline font-light text-on-surface leading-none">الإدارة</span>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleAddUser}
                className="w-full py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-md font-body text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all duration-150 flex items-center justify-center space-x-2 space-x-reverse shadow-[0_4px_14px_0_rgba(0,68,113,0.2)]"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                <span>إضافة مستخدم</span>
              </button>
              <button
                onClick={() => triggerBackup()}
                disabled={isBackupPending}
                className="w-full py-3 bg-surface text-primary border border-outline-variant/30 rounded-md font-body text-sm font-medium hover:bg-surface-container-low active:scale-[0.98] transition-all duration-150 flex items-center justify-center space-x-2 space-x-reverse"
              >
                <span className="material-symbols-outlined text-sm">backup</span>
                <span>{isBackupPending ? "جاري النسخ..." : "نسخ احتياطي"}</span>
              </button>
            </div>
          </div>

          {/* Card 3: System Health */}
          <div className="bg-surface-container-lowest rounded-xl p-6 hover:bg-surface-container-highest transition-colors duration-300 flex flex-col">
            <div className="flex items-center space-x-2 space-x-reverse mb-6">
              <span className="material-symbols-outlined text-primary text-sm">dns</span>
              <h2 className="text-sm font-label uppercase tracking-widest text-on-surface-variant">صحة النظام</h2>
            </div>
            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-end">
                <span className="text-xs font-label text-on-surface-variant">التخزين</span>
                <span className="text-sm font-body font-medium text-on-surface">{summaryLoading ? '-' : `${storagePercentage.toFixed(1)}%`}</span>
              </div>
              <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden" dir="ltr">
                <div className="bg-tertiary h-full" style={{ width: `${storagePercentage}%`, float: 'right' }}></div>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="text-xs font-label text-on-surface-variant">المستخدم</span>
                <span className="text-sm font-body font-medium text-on-surface" dir="ltr">{summaryLoading ? '-' : formatStorageSize(summary?.storageUsedBytes || '0')}</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="text-xs font-label text-on-surface-variant">النسخ الاحتياطي الأخير</span>
                <span className="text-sm font-body font-medium text-on-surface">{backupsLoading ? '-' : (lastBackup?.completedAt ? new Date(lastBackup.completedAt).toLocaleDateString('ar-EG') : 'لا يوجد')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Audit Log Table */}
        <div>
          <div className="flex items-center space-x-2 space-x-reverse mb-6 mr-2">
            <span className="material-symbols-outlined text-primary text-sm">history</span>
            <h2 className="text-sm font-label uppercase tracking-widest text-on-surface-variant">سجلات التدقيق الأخيرة</h2>
          </div>
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-outline-variant/10">
                  <th className="py-4 px-6 text-[0.7rem] font-label uppercase tracking-widest text-on-surface-variant font-medium">الطابع الزمني</th>
                  <th className="py-4 px-6 text-[0.7rem] font-label uppercase tracking-widest text-on-surface-variant font-medium">المستخدم</th>
                  <th className="py-4 px-6 text-[0.7rem] font-label uppercase tracking-widest text-on-surface-variant font-medium">الإجراء</th>
                  <th className="py-4 px-6 text-[0.7rem] font-label uppercase tracking-widest text-on-surface-variant font-medium text-left">معرف الهدف</th>
                </tr>
              </thead>
              <tbody className="font-body text-sm">
                {auditLoading ? (
                  <tr><td colSpan={4} className="py-4 px-6 text-center text-on-surface-variant">جاري التحميل...</td></tr>
                ) : auditLogs?.data?.length ? (
                  auditLogs.data.map((log, index) => (
                    <tr key={log.id} className={`${index % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'} hover:bg-surface-container-low transition-colors group`}>
                      <td className="py-4 px-6 text-on-surface-variant font-mono text-xs" dir="ltr" style={{ textAlign: 'right' }}>
                        {new Date(log.occurredAt).toISOString().substring(0, 16).replace('T', ' ')}Z
                      </td>
                      <td className="py-4 px-6 font-medium text-on-surface flex items-center space-x-2 space-x-reverse">
                        <div className="w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-[0.6rem] font-bold">
                          {log.user ? log.user.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span>{log.user ? log.user.username : '-'}</span>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">{log.action}</td>
                      <td className="py-4 px-6 text-left font-mono text-xs text-primary group-hover:text-tertiary transition-colors" dir="ltr">
                        {log.targetId || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="py-4 px-6 text-center text-on-surface-variant">لا توجد سجلات</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};