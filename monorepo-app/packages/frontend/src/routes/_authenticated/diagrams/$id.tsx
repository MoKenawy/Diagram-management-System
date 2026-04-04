// src/routes/diagrams.$id.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

const DiagramPage = lazy(() => import('@/pages/DiagramPage'));

export const Route = createFileRoute('/_authenticated/diagrams/$id')({
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      throw redirect({ to: '/login' });
    }
  },
  component: () => (
    <Suspense fallback={<DashboardSkeleton />}>
      <DiagramPage />
    </Suspense>
  ),
});