// src/components/layout/AppShell.tsx
import { Box, Container, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Logout } from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const { user, logout } = useAuthStore();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }} dir="rtl">
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #e0e0e0',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1, color: '#1b5e20' }}>
            🌿 Diagram System
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            {user?.fullName}
          </Typography>
          <IconButton onClick={logout} size="small">
            <Logout fontSize="small" />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
};