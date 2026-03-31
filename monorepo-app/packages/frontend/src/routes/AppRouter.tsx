// src/routes/AppRouter.tsx  — update the dashboard import
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from '../components/layout/AppShell';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ArchivePage } from '../pages/ArchivePage';
import { DiagramPage } from '../pages/DiagramPage';
import { ReportsPage } from '../pages/ReportsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { AdminLayout } from '../pages/admin/AdminLayout';
import { UsersPage } from '../pages/admin/UsersPage';
import { ConfigPage } from '../pages/admin/ConfigPage';
import { BackupsPage } from '../pages/admin/BackupsPage';
import { ReplicationPage } from '../pages/admin/ReplicationPage';
import { AuditPage } from '../pages/admin/AuditPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'archive',
        element: (
          <ProtectedRoute allowedRoles={['ENGINEER', 'DC', 'ADMIN']}>
            <ArchivePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'diagrams/:id',
        element: (
          <ProtectedRoute allowedRoles={['ENGINEER', 'DC', 'ADMIN']}>
            <DiagramPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/admin/users" replace />,
          },
          { path: 'users', element: <UsersPage /> },
          { path: 'config', element: <ConfigPage /> },
          { path: 'backups', element: <BackupsPage /> },
          { path: 'replication', element: <ReplicationPage /> },
          { path: 'audit', element: <AuditPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}