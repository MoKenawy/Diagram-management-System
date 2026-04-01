import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Building2,
  FileText,
  BarChart3,
} from 'lucide-react';
import { cn } from '../../utils/cn';

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  MANAGER: 'bg-amber-100 text-amber-700',
  ENGINEER: 'bg-blue-100 text-blue-700',
  DC: 'bg-emerald-100 text-emerald-700',
  VIEWER: 'bg-slate-100 text-slate-700',
};

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['VIEWER', 'ENGINEER', 'DC', 'MANAGER', 'ADMIN'] },
  { to: '/reports', label: 'Reports', icon: FileText, roles: ['ENGINEER', 'DC', 'MANAGER', 'ADMIN'] },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['MANAGER', 'ADMIN'] },
  { to: '/departments', label: 'Departments', icon: Building2, roles: ['MANAGER', 'ADMIN'] },
  { to: '/users', label: 'User Management', icon: Users, roles: ['ADMIN'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['ADMIN'] },
];

export function Layout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const filteredNav = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 transition-transform duration-300 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-700/50 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">AuthPanel</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-slate-400 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {filteredNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-700/60 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="border-t border-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-sm font-bold text-white">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.fullName}
              </p>
              <p className="truncate text-xs text-slate-400">
                @{user?.username}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block" />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-xs font-bold text-white">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <span className="hidden font-medium text-slate-700 sm:block">
                {user?.fullName}
              </span>
              <span
                className={cn(
                  'hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline-block',
                  roleColors[user?.role || 'VIEWER']
                )}
              >
                {user?.role}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-slate-500">@{user?.username}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
