// src/components/dashboard/engineer/EngineerQuickSearch.tsx
import { useState, useCallback } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search } from '@mui/icons-material';

interface EngineerQuickSearchProps {
  onSearch: (query: string) => void;
}

export const EngineerQuickSearch = ({ onSearch }: EngineerQuickSearchProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        onSearch(query.trim());
      }
    },
    [query, onSearch]
  );

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        placeholder="ابحث عن لوحة..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        fullWidth
        size="small"
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': { borderRadius: 3, backgroundColor: '#fff' },
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton type="submit" edge="end">
                  <Search />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </form>
  );
};