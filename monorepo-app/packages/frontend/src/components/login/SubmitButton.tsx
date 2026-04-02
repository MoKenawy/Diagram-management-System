// src/components/login/SubmitButton.tsx
import { Button, CircularProgress } from '@mui/material';

interface SubmitButtonProps {
  isLoading: boolean;
}

const buttonStyles = {
  mt: 1,
  py: 1.5,
  borderRadius: 3,
  textTransform: 'none',
  fontWeight: 600,
  background: 'linear-gradient(90deg, #2e7d32, #66bb6a)',
  boxShadow: '0 4px 14px rgba(46,125,50,0.3)',
  '&:hover': {
    background: 'linear-gradient(90deg, #1b5e20, #4caf50)',
  },
} as const;

export const SubmitButton = ({ isLoading }: SubmitButtonProps) => (
  <Button
    type="submit"
    variant="contained"
    size="large"
    disabled={isLoading}
    startIcon={isLoading ? <CircularProgress size={18} /> : null}
    sx={buttonStyles}
  >
    {isLoading ? 'Signing in...' : 'Sign In'}
  </Button>
);