// src/routes/dashboard.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import  DashboardPage  from '@/pages/DashboardPage';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      throw redirect({ to: '/login' });
    }
  },
  component:  () => {
    // const { lazy } = await import('react');
    // const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
    return <DashboardPage />;
  },
});