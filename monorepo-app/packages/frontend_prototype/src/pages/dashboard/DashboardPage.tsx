import { useAuthStore } from '../../store/authStore';
import { EngineerDashboard } from './EngineerDashboard';
import { DCDashboard } from './DCDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { AdminDashboard } from './AdminDashboard';
import { useLanguage } from '../../hooks/useLanguage';
import type { ReactNode } from 'react';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { t } = useLanguage();

  const renderDashboard = (): ReactNode => {
    switch (user?.role) {
      case 'ENGINEER':
        return <EngineerDashboard />;
      case 'DC':
        return <DCDashboard />;
      case 'MANAGER':
        return <ManagerDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      default:
        return (
          <div className="py-20 text-center text-slate-400">
            {t('noData')}
          </div>
        );
    }
  };

  return renderDashboard();
}
