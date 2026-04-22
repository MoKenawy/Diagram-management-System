// src/components/layout/AppShell.tsx
import { Box, Container } from '@mui/material';
import type { ReactNode } from 'react';
import { TopNavBar } from './SearchNavBar';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }} dir="rtl">
      <TopNavBar />

      <Container maxWidth="xl" disableGutters>
        {children}
      </Container>
    </Box>
  );
};