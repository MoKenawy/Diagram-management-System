// src/components/diagrams/ViewToggle.tsx
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { GridView, TableRows } from '@mui/icons-material';

interface ViewToggleProps {
  view: 'grid' | 'table';
  onChange: (view: 'grid' | 'table') => void;
}

export const ViewToggle = ({ view, onChange }: ViewToggleProps) => (
  <ToggleButtonGroup
    value={view}
    exclusive
    onChange={(_, newView) => {
      if (newView) onChange(newView);
    }}
    size="small"
    sx={{
      '& .MuiToggleButton-root': {
        borderRadius: 2,
        px: 1.5,
      },
    }}
  >
    <ToggleButton value="grid" aria-label="grid view">
      <GridView fontSize="small" />
    </ToggleButton>
    <ToggleButton value="table" aria-label="table view">
      <TableRows fontSize="small" />
    </ToggleButton>
  </ToggleButtonGroup>
);