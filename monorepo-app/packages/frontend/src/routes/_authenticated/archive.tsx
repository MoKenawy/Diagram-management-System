// src/routes/archive.tsx
import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
// import { useAuthStore } from '@/stores/authStore';
import { archiveSearchSchema } from '@/validations/archiveSearchSchema';
import { ArchivePageSkeleton } from '@/components/diagrams/ArchivePageSkeleton';

const ArchivePage = lazy(() => import('@/pages/ArchivePage'));

export const Route = createFileRoute('/_authenticated/archive')({
  validateSearch: (search) => archiveSearchSchema.parse(search),
  component: () => (
    <Suspense fallback={<ArchivePageSkeleton />}>
      <ArchivePage />
    </Suspense>
  ),
});