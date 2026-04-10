// src/routes/_authenticated/admin/config.tsx

import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { AdminConfigPageSkeleton } from '@/components/admin/AdminSkeletons';

const AdminConfigPage = lazy(() => 
  import('@/pages/admin/AdminConfigPage').then(m => ({ default: m.AdminConfigPage }))
);

export const Route = createFileRoute('/_authenticated/admin/config')({
  component: () => (
    <Suspense fallback={<AdminConfigPageSkeleton />}>
      <AdminConfigPage />
    </Suspense>
  ),
});