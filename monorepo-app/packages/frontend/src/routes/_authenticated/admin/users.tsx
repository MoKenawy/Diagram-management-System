// src/routes/_authenticated/admin/users.tsx

import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { AdminUsersPageSkeleton } from '@/components/admin/AdminSkeletons';

// Resolve the named export dynamically
const AdminUsersPage = lazy(() => 
  import('@/pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage }))
);

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: () => (
    <Suspense fallback={<AdminUsersPageSkeleton />}>
      <AdminUsersPage />
    </Suspense>
  ),
});