// src/components/diagrams/DiagramCardMenu.tsx
import { useState, useCallback } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Settings, Edit, Security, Upload, DeleteOutline } from '@mui/icons-material';

interface DiagramCardMenuProps {
  onEditMetadata: () => void;
  onManageAccess: () => void;
  onUploadRevision: () => void;
  onDeactivate: () => void;
}

export const DiagramCardMenu = ({
  onEditMetadata,
  onManageAccess,
  onUploadRevision,
  onDeactivate,
}: DiagramCardMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchorEl);

  const handleOpen = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  }, []);

  const handleClose = useCallback(() => setAnchorEl(null), []);

  const createHandler = useCallback(
    (action: () => void) => (e: React.MouseEvent) => {
      e.stopPropagation();
      handleClose();
      action();
    },
    [handleClose]
  );

  return (
    <>
      <IconButton size="small" onClick={handleOpen} sx={{ color: 'text.secondary' }}>
        <Settings fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 180 } } }}
      >
        <MenuItem onClick={createHandler(onEditMetadata)}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>تعديل البيانات</ListItemText>
        </MenuItem>
        <MenuItem onClick={createHandler(onManageAccess)}>
          <ListItemIcon><Security fontSize="small" /></ListItemIcon>
          <ListItemText>إدارة الصلاحيات</ListItemText>
        </MenuItem>
        <MenuItem onClick={createHandler(onUploadRevision)}>
          <ListItemIcon><Upload fontSize="small" /></ListItemIcon>
          <ListItemText>رفع مراجعة</ListItemText>
        </MenuItem>
        <MenuItem onClick={createHandler(onDeactivate)} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteOutline fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>تعطيل</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};