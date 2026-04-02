// src/components/login/LoginFooter.tsx
import { Box, Divider, Link } from '@mui/material';

export const LoginFooter = () => (
  <>
    <Divider sx={{ my: 2 }} />
    <Box display="flex" justifyContent="space-between">
      <Link href="#" underline="hover" color="#2e7d32">
        Forgot password?
      </Link>
      <Link href="#" underline="hover" color="#2e7d32">
        Need help?
      </Link>
    </Box>
  </>
);