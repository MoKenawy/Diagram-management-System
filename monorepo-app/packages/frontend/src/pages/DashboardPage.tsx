// src/pages/dashboard/DashboardPage.tsx
import { Suspense, lazy } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { Role } from '@/types/index';

const EngineerDashboard = lazy(() =>
  import('@/components/dashboard/EngineerDashboard').then((m) => ({ default: m.EngineerDashboard }))
);
const DCDashboard = lazy(() =>
  import('@/components/dashboard/DCDashboard').then((m) => ({ default: m.DCDashboard }))
);
const ManagerDashboard = lazy(() =>
  import('@/components/dashboard/ManagerDashboard').then((m) => ({ default: m.ManagerDashboard }))
);
const AdminDashboard = lazy(() =>
  import('@/components/dashboard/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

const DASHBOARD_BY_ROLE: Record<Role, React.LazyExoticComponent<React.ComponentType>> = {
  [Role.ENGINEER]: EngineerDashboard,
  [Role.DC]: DCDashboard,
  [Role.MANAGER]: ManagerDashboard,
  [Role.ADMIN]: AdminDashboard,
};

const DashboardPage = () => {
  const role = useAuthStore((state) => state.user?.role);

  if (!role) return null;

  const DashboardComponent = DASHBOARD_BY_ROLE[role];

  return (

    <div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardComponent />
      </Suspense>
      </div>

  );
};

export default DashboardPage;