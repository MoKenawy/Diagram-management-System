// src/components/login/PasswordField.tsx
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface PasswordFieldProps {
  registration: UseFormRegisterReturn<'password'>;
  error?: FieldError;
  disabled: boolean;
  showPassword: boolean;
  onToggleVisibility: () => void;
}

const fieldStyles = {
  '& .MuiOutlinedInput-root': { borderRadius: 3 },
} as const;

export const PasswordField = ({
  registration,
  error,
  disabled,
  showPassword,
  onToggleVisibility,
}: PasswordFieldProps) => (
  <TextField
    label="Password"
    type={showPassword ? 'text' : 'password'}
    variant="outlined"
    fullWidth
    disabled={disabled}
    error={!!error}
    helperText={error?.message}
    sx={fieldStyles}
    slotProps={{
      input: {
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={onToggleVisibility}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      },
    }}
    {...registration}
  />
);