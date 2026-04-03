// src/components/diagrams/DiagramFilters.tsx
import { useState, useCallback } from 'react';
import {
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Paper,
} from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { DiagramFiltersContent } from './DiagramFiltersContent';
import { useActiveDepartments } from '@/hooks/queries/useDepartmentQueries';
import type { FileFormat, Role } from '@/types/index';

const SIDEBAR_WIDTH = 280;

interface DiagramFiltersProps {
  selectedFormats: FileFormat[];
  selectedDepartments: string[];
  uploadedFrom: string;
  uploadedTo: string;
  userRole: Role;
  hasActiveFilters: boolean;
  onToggleFormat: (format: FileFormat) => void;
  onDepartmentsChange: (ids: string[]) => void;
  onDateChange: (from?: string, to?: string) => void;
  onClear: () => void;
}

export const DiagramFilters = (props: DiagramFiltersProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: departments = [] } = useActiveDepartments();

  const toggleDrawer = useCallback(() => setDrawerOpen((prev) => !prev), []);

  const filtersContent = (
    <DiagramFiltersContent
      {...props}
      departments={departments}
    />
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          onClick={toggleDrawer}
          sx={{
            position: 'fixed',
            bottom: 80,
            left: 16,
            zIndex: 1100,
            backgroundColor: 'white',
            boxShadow: 2,
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}
        >
          <FilterList />
        </IconButton>

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={toggleDrawer}
          slotProps={{ paper: { sx: { width: SIDEBAR_WIDTH, borderRadius: '16px 0 0 16px' } } }}
        >
          {filtersContent}
        </Drawer>
      </>
    );
  }

  return (
    <Paper
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        borderRadius: 3,
        position: 'sticky',
        top: 80,
        alignSelf: 'flex-start',
        border: '1px solid #e0e0e0',
        boxShadow: 'none',
      }}
    >
      {filtersContent}
    </Paper>
  );
};