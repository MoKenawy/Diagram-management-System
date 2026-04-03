// src/components/diagrams/ArchiveSearchBar.tsx
import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';

interface ArchiveSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const ArchiveSearchBar = ({ value, onChange, disabled }: ArchiveSearchBarProps) => (
  <TextField
    placeholder="ابحث بالعنوان أو الوسم..."
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    fullWidth
    size="small"
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: 3,
        backgroundColor: '#fff',
      },
    }}
    slotProps={{
      input: {
        startAdornment: (
          <InputAdornment position="start">
            <Search color="action" />
          </InputAdornment>
        ),
      },
    }}
  />
);