// src/components/layout/AppShell.tsx
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '../../store/authStore';
import { useLanguage } from '../../hooks/useLanguage';
import clsx from 'clsx';

interface NavItem {
  to: string;
  labelKey: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const allRoles: UserRole[] = ['VIEWER', 'ENGINEER', 'DC', 'MANAGER', 'ADMIN'];

const navItems: NavItem[] = [
  {
    to: '/dashboard',
    labelKey: 'nav.dashboard',
    roles: allRoles,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/archive',
    labelKey: 'nav.archive',
    roles: ['ENGINEER', 'DC', 'ADMIN'],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    to: '/reports',
    labelKey: 'nav.reports',
    roles: ['MANAGER', 'ADMIN'],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    to: '/admin',
    labelKey: 'nav.admin',
    roles: ['ADMIN'],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// Role badge colors
const roleBadgeColors: Record<UserRole, string> = {
  VIEWER: 'bg-gray-100 text-gray-700',
  ENGINEER: 'bg-blue-100 text-blue-700',
  DC: 'bg-purple-100 text-purple-700',
  MANAGER: 'bg-amber-100 text-amber-700',
  ADMIN: 'bg-red-100 text-red-700',
};

export function AppShell() {
  const { t, toggleLanguage, isRTL, lang } = useLanguage();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <header className="fixed inset-x-0 top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="hidden font-bold text-gray-900 sm:block">
                {t('app.shortTitle')}
              </span>
            </div>
          </div>

          {/* Right: User info + actions */}
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              title={t('common.switchLanguage')}
            >
              {lang === 'ar' ? 'EN' : 'ع'}
            </button>

            {/* User info */}
            {user && (
              <div className="hidden items-center gap-2 sm:flex">
                {/* Avatar */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  {user.fullName.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 leading-tight">
                    {user.fullName}
                  </span>
                  <span
                    className={clsx(
                      'inline-block self-start rounded px-1.5 py-0.5 text-xs font-medium leading-tight',
                      roleBadgeColors[user.role]
                    )}
                  >
                    {t(`roles.${user.role}`)}
                  </span>
                </div>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              title={t('auth.logout')}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — desktop: inset-inline-start for RTL support */}
      <aside
        className={clsx(
          'fixed top-16 z-50 flex h-[calc(100vh-4rem)] w-64 flex-col border-gray-200 bg-white transition-transform duration-300 lg:z-20',
          // Desktop: always visible
          'lg:translate-x-0',
          // Use logical properties for RTL
          'inset-inline-start-0 border-ie',
          // Mobile: slide in/out
          sidebarOpen
            ? 'translate-x-0'
            : isRTL
              ? 'translate-x-full lg:translate-x-0'
              : '-translate-x-full lg:translate-x-0'
        )}
      >
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    )
                  }
                >
                  {item.icon}
                  <span>{t(item.labelKey)}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="text-xs text-gray-400 text-center">
            v1.0.0
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={clsx(
          'pt-16 transition-all duration-300',
          // Desktop: offset by sidebar width using logical margin
          'lg:mis-64'
        )}
      >
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white lg:hidden">
        <div className="flex items-center justify-around">
          {filteredNavItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-500'
                )
              }
            >
              {item.icon}
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}