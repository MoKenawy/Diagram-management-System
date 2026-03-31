// src/pages/admin/AdminLayout.tsx
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import clsx from 'clsx';

export function AdminLayout() {
  const { t } = useLanguage();

  const adminLinks = [
    { to: '/admin/users', label: t('nav.users') },
    { to: '/admin/config', label: t('nav.config') },
    { to: '/admin/backups', label: t('nav.backups') },
    { to: '/admin/replication', label: t('nav.replication') },
    { to: '/admin/audit', label: t('nav.audit') },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.title')}</h1>

      {/* Admin sub-navigation */}
      <div className="mb-6 flex flex-wrap gap-2">
        {adminLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              clsx(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}