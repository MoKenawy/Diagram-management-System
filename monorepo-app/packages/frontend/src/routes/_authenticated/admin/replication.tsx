// src/routes/_authenticated/admin/replication.tsx


import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { AdminReplicationPageSkeleton } from '@/components/admin/AdminSkeletons';

const AdminReplicationPage = lazy(() => 
  import('@/pages/admin/AdminReplicationPage').then(m => ({ default: m.AdminReplicationPage }))
);

export const Route = createFileRoute('/_authenticated/admin/replication')({
  component: () => (
    <Suspense fallback={<AdminReplicationPageSkeleton />}>
      <AdminReplicationPage />
    </Suspense>
  ),
});