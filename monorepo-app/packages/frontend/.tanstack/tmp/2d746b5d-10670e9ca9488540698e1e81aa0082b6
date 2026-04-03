// src/routes/archive.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { archiveSearchSchema } from '@/validations/archiveSearchSchema';
import { ArchivePageSkeleton } from '@/components/diagrams/ArchivePageSkeleton';

const ArchivePage = lazy(() => import('@/pages/ArchivePage'));

export const Route = createFileRoute('/archive')({
  validateSearch: (search) => archiveSearchSchema.parse(search),
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      throw redirect({ to: '/login' });
    }
  },
  component: () => (
    <Suspense fallback={<ArchivePageSkeleton />}>
      <ArchivePage />
    </Suspense>
  ),
});