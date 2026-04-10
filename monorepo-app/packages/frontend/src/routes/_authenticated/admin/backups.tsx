// src/routes/_authenticated/admin/backups.tsx

import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { AdminBackupsPageSkeleton } from '@/components/admin/AdminSkeletons';

const AdminBackupsPage = lazy(() => 
  import('@/pages/admin/AdminBackupsPage').then(m => ({ default: m.AdminBackupsPage }))
);

export const Route = createFileRoute('/_authenticated/admin/backups')({
  component: () => (
    <Suspense fallback={<AdminBackupsPageSkeleton />}>
      <AdminBackupsPage />
    </Suspense>
  ),
});