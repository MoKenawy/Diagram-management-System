// src/routes/_authenticated/diagrams/create.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';

import { useAuthStore } from '@/stores/authStore';
import { Role } from '@/types/index';
import CreateDiagramPage from '@/pages/CreateDiagramPage';

export const Route = createFileRoute('/_authenticated/diagrams/create')({
  beforeLoad: () => {
    const role = useAuthStore.getState().user?.role;

    // Client-side convenience guard. Only DC and ADMIN may upload diagrams;
    // the backend re-checks authorization on POST /api/diagrams.
    if (role !== Role.DC && role !== Role.ADMIN) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: CreateDiagramPage,
});
