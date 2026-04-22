import React from 'react';
import { Outlet, Link, useLocation } from '@tanstack/react-router';

const NAV_ITEMS = [
  { label: 'لوحة القيادة', path: '/', icon: 'dashboard' },
  { label: 'الأرشيف', path: '/archive', icon: 'inventory_2' },
  { label: 'المستخدمين', path: '/admin/users', icon: 'group' },
  { label: 'سجلات التدقيق', path: '/admin/audit', icon: 'history' },
  { label: 'النسخ الاحتياطي', path: '/admin/backups', icon: 'backup' },
  { label: 'النسخ المتزامن', path: '/admin/replication', icon: 'sync_alt' },
  { label: 'إعدادات المسؤول', path: '/admin/config', icon: 'admin_panel_settings' },
];

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="bg-background text-on-background antialiased flex h-screen overflow-hidden" dir="rtl">
      {/* SideNavBar */}
      <nav className="bg-surface-container-high dark:bg-[#0f172a] h-screen w-72 flex flex-col fixed right-0 top-0 z-40">
        <div className="flex flex-col h-full py-8 space-y-2">
          {/* Header */}
          <div className="px-6 mb-8">
            <div className="flex items-center space-x-3 space-x-reverse mb-2">
              <img
                alt="شعار الهندسة"
                className="w-10 h-10 rounded-DEFAULT object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQh6XIyxwYrAyYAfGYxgKkDKVhAObH_okiVX6QaAJ96mh4Gpk-ZuE1i15gLJgxCM_jATGbCcYnrhWGrGZNaaX4HLuu1y5RAYsVjTQIbbmYtGfZN05KPmmu6FAb0UM0TjL55_NmAfzKHAvatfb8YbZsJBJkBYHwFf5f5N7lCXx5s9zKjyAvijU1GlnRG8ZxllYD7yoE8uE891BRAwnWDax5ySP25MNIC2sQzWb4clfr4SRjJO43GKXY0C_eCcHxrcvhDaWCJmitbiXm"
              />
              <div className="flex flex-col">
                <span className="text-lg font-black uppercase tracking-widest text-[#004471] font-headline">مشروع ألفا</span>
                <span className="text-xs text-[#004471]/70 font-label">نظام الأرشيف</span>
              </div>
            </div>
          </div>
          {/* Navigation Links */}
          <div className="flex-1 flex flex-col space-y-2 relative">
            <div className="absolute inset-y-0 left-0 w-px bg-[#d8e3fb] dark:bg-[#1e293b]"></div>
            {NAV_ITEMS.map((item) => {
              const isSelected = item.path === '/' 
                ? location.pathname === '/' || location.pathname === '/dashboard'
                : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={
                    isSelected
                      ? "bg-[#ffffff] dark:bg-[#1e293b] text-[#004471] dark:text-white rounded-r-full mr-4 shadow-sm flex items-center px-6 py-4 font-['IBM_Plex_Sans_Arabic','Inter'] font-medium z-10 group transition-all duration-200"
                      : "text-[#004471]/70 dark:text-surface-container-high/70 px-6 py-4 flex items-center hover:bg-surface-container-low/50 dark:hover:bg-[#1e293b]/50 transition-all font-['IBM_Plex_Sans_Arabic','Inter'] font-medium z-10 group rounded-r-full mr-4"
                  }
                >
                  <span
                    className="material-symbols-outlined ml-4 group-hover:-translate-x-1 transition-all duration-200"
                    style={isSelected ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
          {/* Footer */}
          <div className="mt-auto px-4 z-10">
            <a
              href="#"
              className="text-[#004471]/70 dark:text-surface-container-high/70 px-6 py-4 flex items-center hover:bg-surface-container-low/50 dark:hover:bg-[#1e293b]/50 transition-all font-['IBM_Plex_Sans_Arabic','Inter'] font-medium group rounded-r-full"
            >
              <span className="material-symbols-outlined ml-4 group-hover:-translate-x-1 transition-all duration-200">
                help_outline
              </span>
              مركز المساعدة
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="mr-72 flex-1 flex flex-col h-screen relative bg-surface overflow-hidden">
        {/* Dynamic Route Content */}
        {children ?? <Outlet />}
      </main>
    </div>
  );
};
