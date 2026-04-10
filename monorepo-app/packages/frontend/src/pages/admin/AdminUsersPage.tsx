import { useState } from 'react';
import { 
  Box, Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableHead, TableRow, Chip, IconButton, Menu
} from '@mui/material';
import { Add, MoreVert, Edit, VpnKey, Block, CheckCircle } from '@mui/icons-material';
import { useAdminUsers, useToggleUserStatus } from '@/hooks/queries/useAdminQueries';
import { useActiveDepartments } from '@/hooks/queries/useDepartmentQueries';
import { Role } from '@/types/index';

import { UserFormModal } from '@/components/admin/UserFormModal';
import { PasswordResetModal } from '@/components/admin/PasswordResetModal';

export const AdminUsersPage = () => {
  const [filters, setFilters] = useState({ search: '', role: '', departmentId: '', isActive: '' });
  const [page, _] = useState(1);
  const limit = 10;

  const { data } = useAdminUsers({ 
    ...filters, page, limit, 
    role: filters.role as Role, 
    isActive: filters.isActive ? filters.isActive === 'true' : undefined 
  });
  
  const { data: departments = [] } = useActiveDepartments();
  const toggleMutation = useToggleUserStatus('', false);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<any>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: any) => {
    setAnchorEl(event.currentTarget);
    setMenuUser(user);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUser(null);
  };

  const handleToggleActive = async () => {
    if (confirm(`هل أنت متأكد من تغيير حالة ${menuUser.fullName}؟`)) {
      // Re-initialize mutation with right ID (in standard implementation)
      await toggleMutation.mutateAsync(); 
    }
    handleMenuClose();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField size="small" label="بحث..." value={filters.search} onChange={e => setFilters(f => ({...f, search: e.target.value}))} />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>الدور</InputLabel>
          <Select value={filters.role} label="الدور" onChange={e => setFilters(f => ({...f, role: e.target.value}))}>
            <MenuItem value="">الكل</MenuItem>
            {Object.values(Role).map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>القسم</InputLabel>
          <Select value={filters.departmentId} label="القسم" onChange={e => setFilters(f => ({...f, departmentId: e.target.value}))}>
            <MenuItem value="">الكل</MenuItem>
            {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.nameAr}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>الحالة</InputLabel>
          <Select value={filters.isActive} label="الحالة" onChange={e => setFilters(f => ({...f, isActive: e.target.value}))}>
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="true">نشط</MenuItem>
            <MenuItem value="false">غير نشط</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" startIcon={<Add />} onClick={() => { setSelectedUser(null); setFormModalOpen(true); }}>
          إضافة مستخدم
        </Button>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>اسم المستخدم</TableCell>
            <TableCell>الاسم الكامل</TableCell>
            <TableCell>الدور</TableCell>
            <TableCell>القسم</TableCell>
            <TableCell>الحالة</TableCell>
            <TableCell align="center">إجراءات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.data.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.fullName}</TableCell>
              <TableCell><Chip label={user.role} size="small" color="primary" variant="outlined" /></TableCell>
              <TableCell>{user.department?.nameAr || '-'}</TableCell>
              <TableCell>
                <Chip label={user.isActive ? 'نشط' : 'غير نشط'} color={user.isActive ? 'success' : 'default'} size="small" />
              </TableCell>
              <TableCell align="center">
                <IconButton size="small" onClick={(e) => handleMenuClick(e, user)}>
                  <MoreVert />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { setSelectedUser(menuUser); setFormModalOpen(true); handleMenuClose(); }}>
          <Edit sx={{ mr: 1, fontSize: 20 }} /> تعديل
        </MenuItem>
        <MenuItem onClick={() => { setSelectedUser(menuUser); setResetModalOpen(true); handleMenuClose(); }}>
          <VpnKey sx={{ mr: 1, fontSize: 20 }} /> إعادة تعيين كلمة المرور
        </MenuItem>
        <MenuItem onClick={handleToggleActive} sx={{ color: menuUser?.isActive ? 'error.main' : 'success.main' }}>
          {menuUser?.isActive ? <Block sx={{ mr: 1, fontSize: 20 }} /> : <CheckCircle sx={{ mr: 1, fontSize: 20 }} />} 
          {menuUser?.isActive ? 'تعطيل' : 'تفعيل'}
        </MenuItem>
      </Menu>

      <UserFormModal open={formModalOpen} onClose={() => setFormModalOpen(false)} user={selectedUser} departments={departments} />
      {selectedUser && <PasswordResetModal open={resetModalOpen} onClose={() => setResetModalOpen(false)} userId={selectedUser.id} username={selectedUser.username} />}
    </Box>
  );
};