// src/components/login/LoginCard.tsx
import { Box, Card, CardContent, Container } from '@mui/material';
import type { ReactNode } from 'react';

interface LoginCardProps {
  children: ReactNode;
}

const backgroundStyles = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
} as const;

const cardStyles = {
  borderRadius: 4,
  backdropFilter: 'blur(10px)',
  background: 'rgba(255,255,255,0.9)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  overflow: 'hidden',
} as const;

const accentBarStyles = {
  height: 6,
  background: 'linear-gradient(90deg, #2e7d32, #66bb6a)',
} as const;

export const LoginCard = ({ children }: LoginCardProps) => (
  <Box sx={backgroundStyles}>
    <Container maxWidth="sm">
      <Card elevation={0} sx={cardStyles}>
        <Box sx={accentBarStyles} />
        <CardContent sx={{ p: 5 }}>{children}</CardContent>
      </Card>
    </Container>
  </Box>
);