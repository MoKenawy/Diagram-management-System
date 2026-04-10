import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { AdminAuditPageSkeleton } from '@/components/admin/AdminSkeletons';

const AdminAuditPage = lazy(() => 
  import('@/pages/admin/AdminAuditPage').then(m => ({ default: m.AdminAuditPage }))
);

export const Route = createFileRoute('/_authenticated/admin/audit')({
  component: () => (
    <Suspense fallback={<AdminAuditPageSkeleton />}>
      <AdminAuditPage />
    </Suspense>
  ),
});