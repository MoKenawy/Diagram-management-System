// src/components/shared/DateRangePicker.tsx
import { Box, TextField } from '@mui/material';

interface DateRangePickerProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

export const DateRangePicker = ({ from, to, onFromChange, onToChange }: DateRangePickerProps) => (
  <Box display="flex" gap={2} alignItems="center">
    <TextField
      label="من"
      type="date"
      size="small"
      value={from}
      onChange={(e) => onFromChange(e.target.value)}
      slotProps={{ inputLabel: { shrink: true } }}
      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
    />
    <TextField
      label="إلى"
      type="date"
      size="small"
      value={to}
      onChange={(e) => onToChange(e.target.value)}
      slotProps={{ inputLabel: { shrink: true } }}
      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
    />
  </Box>
);