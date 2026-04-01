// src/components/login/UsernameField.tsx
import { TextField } from '@mui/material';
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface UsernameFieldProps {
  registration: UseFormRegisterReturn<'username'>;
  error?: FieldError;
  disabled: boolean;
}

const fieldStyles = {
  '& .MuiOutlinedInput-root': { borderRadius: 3 },
} as const;

export const UsernameField = ({ registration, error, disabled }: UsernameFieldProps) => (
  <TextField
    label="Username"
    variant="outlined"
    fullWidth
    disabled={disabled}
    error={!!error}
    helperText={error?.message}
    sx={fieldStyles}
    {...registration}
  />
);