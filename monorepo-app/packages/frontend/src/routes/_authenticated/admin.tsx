// src/routes/_authenticated/admin.tsx

import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/pages/admin/AdminLayout';

export const Route = createFileRoute('/_authenticated/admin')({
  component: AdminLayout,
});