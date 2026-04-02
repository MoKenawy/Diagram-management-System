// src/components/dashboard/engineer/EngineerGreeting.tsx
import { Box, Typography } from '@mui/material';
import { formatArabicDate } from '@/utils/formatters';

interface EngineerGreetingProps {
  fullName: string;
}

export const EngineerGreeting = ({ fullName }: EngineerGreetingProps) => (
  <Box mb={4}>
    <Typography variant="h4" fontWeight={700} gutterBottom>
      مرحباً {fullName}
    </Typography>
    <Typography variant="body1" color="text.secondary">
      {formatArabicDate()}
    </Typography>
  </Box>
);