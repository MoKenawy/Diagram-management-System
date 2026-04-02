// src/components/shared/EmptyState.tsx
import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
}

export const EmptyState = ({ icon, title, description }: EmptyStateProps) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    py={8}
    px={4}
  >
    {icon && (
      <Box sx={{ fontSize: 64, mb: 2, opacity: 0.5 }}>{icon}</Box>
    )}
    <Typography variant="h6" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.disabled">
        {description}
      </Typography>
    )}
  </Box>
);