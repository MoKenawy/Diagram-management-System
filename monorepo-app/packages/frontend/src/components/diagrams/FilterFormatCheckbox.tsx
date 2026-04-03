// src/components/diagrams/FilterFormatCheckbox.tsx
import { FormControlLabel, Checkbox } from '@mui/material';
import { FormatBadge } from './FormatBadge';
import type { FileFormat } from '@/types/index';

interface FilterFormatCheckboxProps {
  format: FileFormat;
  checked: boolean;
  onChange: (format: FileFormat) => void;
}

export const FilterFormatCheckbox = ({ format, checked, onChange }: FilterFormatCheckboxProps) => (
  <FormControlLabel
    control={
      <Checkbox
        size="small"
        checked={checked}
        onChange={() => onChange(format)}
      />
    }
    label={<FormatBadge format={format} />}
    sx={{ mr: 0 }}
  />
);