// src/components/login/LoginErrorAlert.tsx
import { Alert } from '@mui/material';

interface LoginErrorAlertProps {
  error: string;
  onClose: () => void;
}

export const LoginErrorAlert = ({ error, onClose }: LoginErrorAlertProps) => (
  <Alert severity="error" sx={{ mb: 2 }} onClose={onClose}>
    {error}
  </Alert>
);