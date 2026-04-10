import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Breadcrumbs } from '@mui/material';
import { Outlet, Link, useLocation } from '@tanstack/react-router';
import { Dashboard, Group, Settings, Backup, SyncAlt, ListAlt, Archive } from '@mui/icons-material';

const NAV_ITEMS = [
  // Assuming your dynamic DashboardPage is at the root '/'

  
  { label: 'لوحة التحكم', path: '/', exact: true, icon: <Dashboard /> }, 
  { label: 'الأرشيف', path: '/archive', exact: true, icon: <Archive /> }, 
  { label: 'المستخدمين', path: '/admin/users', exact: false, icon: <Group /> },
  { label: 'إعدادات النظام', path: '/admin/config', exact: false, icon: <Settings /> },
  { label: 'النسخ الاحتياطي', path: '/admin/backups', exact: false, icon: <Backup /> },
  { label: 'النسخ المتزامن (Replication)', path: '/admin/replication', exact: false, icon: <SyncAlt /> },
  { label: 'سجل النظام (Audit Log)', path: '/admin/audit', exact: false, icon: <ListAlt /> },
];

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();

  const currentNav = NAV_ITEMS.find(item => 
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  );

  return (
    <Box sx={{display: 'flex', minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Box sx={{ width: 280, bgcolor: 'background.paper', borderLeft: '1px solid', borderColor: 'divider', p: 2 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, px: 2 }}>الإدارة</Typography>
        <List>
          {NAV_ITEMS.map((item) => {
            const isSelected = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                <ListItemButton 
                  component={Link} 
                  to={item.path} 
                  selected={isSelected}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isSelected ? 700 : 500 }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, p: 4, display: 'flex', flexDirection: 'column' }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Typography color="inherit">الإدارة</Typography>
          <Typography color="text.primary" fontWeight="bold">{currentNav?.label}</Typography>
        </Breadcrumbs>
        
        <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', borderRadius: 3, p: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          {/* If rendered directly as a wrapper, show children. If used in a route, show Outlet */}
          {children ?? <Outlet />}
        </Box>
      </Box>
    </Box>
  );
};