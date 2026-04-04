// src/routes/_authenticated.tsx

import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const { user } = useAuthStore.getState();

    if (!user) {
      throw redirect({
        to: '/login',
      });
    }
  },
});
