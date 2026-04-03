// src/routes/dashboard.tsx
import { createFileRoute } from '@tanstack/react-router';
import  DashboardPage  from '@/pages/DashboardPage';

export const Route = createFileRoute('/dashboard')({
  component:  () => {
    // const { lazy } = await import('react');
    // const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
    return <DashboardPage />;
  },
});