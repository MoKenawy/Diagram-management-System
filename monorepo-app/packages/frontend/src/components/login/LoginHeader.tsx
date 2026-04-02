// src/components/login/LoginHeader.tsx
import { Box, Typography } from '@mui/material';

export const LoginHeader = () => (
  <Box textAlign="center" mb={4}>
    <Typography variant="h4" fontWeight={600} sx={{ color: '#1b5e20' }}>
      🌿 Diagram System
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Organize, manage, and visualize your diagrams
    </Typography>
  </Box>
);