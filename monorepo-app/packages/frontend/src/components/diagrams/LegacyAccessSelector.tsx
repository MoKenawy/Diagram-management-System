// src/components/diagrams/LegacyAccessSelector.tsx
import React from 'react';
import {
  Typography, Box, List, ListItem, ListItemText, Checkbox, Avatar,
  ListItemButton, Collapse, InputAdornment, TextField
} from '@mui/material';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import type { DepartmentFull, UserEngineerResponse } from '@/types/index';
import { useActiveEngineersSearch } from '@/hooks/useActiveEngineersSearch';

interface LegacyAccessSelectorProps {
  departments: DepartmentFull[];
  engineers: UserEngineerResponse[];
  userAccess: string[];
  departmentAccess: string[];
  onChangeUserAccess: (users: string[]) => void;
  onChangeDeptAccess: (depts: string[]) => void;
}

export const LegacyAccessSelector: React.FC<LegacyAccessSelectorProps> = ({
  departments, engineers, userAccess, departmentAccess, onChangeUserAccess, onChangeDeptAccess
}) => {
  const [engineerSearch, setEngineerSearch] = React.useState('');
  const [expandedDepts, setExpandedDepts] = React.useState<Record<string, boolean>>({});
  const filteredEngineers = useActiveEngineersSearch(engineers, engineerSearch);

  const toggleDeptExpansion = (deptId: string) => {
    setExpandedDepts(prev => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Typography variant="h6" gutterBottom>المهندسين (فردي)</Typography>
        <TextField
          fullWidth size="small" placeholder="ابحث عن مهندس..." value={engineerSearch}
          onChange={(e) => setEngineerSearch(e.target.value)} sx={{ mb: 2 }}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
        />
        <List sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0 }}>
          {departments.map(dept => {
            const deptEngineers = filteredEngineers.filter(e => e.departmentId === dept.id);
            if (!deptEngineers.length) return null;
            const isExpanded = !!expandedDepts[dept.id] || engineerSearch.trim().length > 0;

            return (
              <Box key={dept.id}>
                <ListItemButton onClick={() => toggleDeptExpansion(dept.id)} sx={{ bgcolor: 'action.hover' }}>
                  <ListItemText primary={`${dept.nameAr} (${deptEngineers.length})`} primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }} />
                  {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </ListItemButton>
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {deptEngineers.map(engineer => {
                      const isChecked = userAccess.includes(engineer.id);
                      return (
                        <ListItem key={engineer.id} dense sx={{ pl: 4 }}>
                          <Checkbox 
                            checked={isChecked} 
                            onChange={(e) => onChangeUserAccess(e.target.checked ? [...userAccess, engineer.id] : userAccess.filter(id => id !== engineer.id))} 
                          />
                          <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem', bgcolor: 'primary.light' }}>
                            {engineer.fullName.charAt(0)}
                          </Avatar>
                          <ListItemText primary={engineer.fullName} secondary={engineer.username} secondaryTypographyProps={{ fontSize: '0.7rem' }} />
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          })}
        </List>
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <Typography variant="h6" gutterBottom>وصول سريع للأقسام</Typography>
        <List sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0 }}>
          {departments.map(dept => {
            const isChecked = departmentAccess.includes(dept.id);
            return (
              <ListItem key={dept.id} dense divider>
                <Checkbox 
                  checked={isChecked} 
                  onChange={(e) => onChangeDeptAccess(e.target.checked ? [...departmentAccess, dept.id] : departmentAccess.filter(id => id !== dept.id))} 
                />
                <ListItemText primary={dept.nameAr} />
              </ListItem>
            );
          })}
        </List>
      </Grid>
    </Grid>
  );
};