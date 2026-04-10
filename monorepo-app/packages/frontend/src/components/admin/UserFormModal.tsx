import React, { useState, useEffect, useActionState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, Box, Alert, CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Role } from '@/types/index';
import type { UserResponse, DepartmentBasic } from '@/types/index';
import { userFormSchema } from '@/validations/adminSchemas';
import { useCreateUser, useUpdateUser } from '@/hooks/queries/useAdminQueries';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  user?: UserResponse | null;
  departments: DepartmentBasic[];
}

type ActionState = {
  success: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  key: number;
};

export const UserFormModal: React.FC<UserFormModalProps> = ({ open, onClose, user, departments }) => {
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  
  const [selectedRole, setSelectedRole] = useState<string>(user?.role || '');

  useEffect(() => {
    if (open) setSelectedRole(user?.role || '');
  }, [open, user]);

  // Notice the explicit return type: Promise<ActionState>
  const [submitState, formAction, isPending] = useActionState<ActionState, FormData>(
    async (_, formData): Promise<ActionState> => {
      try {
        const rawData = Object.fromEntries(formData.entries());
        const result = userFormSchema.safeParse(rawData);

        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.issues.forEach(i => { fieldErrors[i.path[0] as string] = i.message; });
          return { success: false, error: 'يرجى مراجعة الحقول وإصلاح الأخطاء.', fieldErrors, key: Date.now() };
        }

        const data = result.data;

        if (data.role === Role.ENGINEER && !data.departmentId) {
          return { 
            success: false, error: null, 
            fieldErrors: { departmentId: 'تحديد القسم إلزامي للمهندسين' }, key: Date.now() 
          };
        }

        if (user) {
          await updateUserMutation.mutateAsync({
            id: user.id,
            data: {
              fullName: data.fullName,
              email: data.email || null,
              role: data.role as Role,
              departmentId: data.departmentId || null,
            }
          });
        } else {
          if (!data.password || data.password.length < 8) {
            return { 
              success: false, error: null, 
              fieldErrors: { password: 'كلمة المرور مطلوبة (8 أحرف على الأقل)' }, key: Date.now() 
            };
          }
          await createUserMutation.mutateAsync({
            username: data.username,
            fullName: data.fullName,
            email: data.email || null,
            role: data.role as Role,
            departmentId: data.departmentId || null,
            password: data.password
          });
        }

        return { success: true, error: null, fieldErrors: {}, key: Date.now() };
      } catch (err: any) {
        return { 
          success: false, 
          error: err.response?.data?.message || err.message || 'حدث خطأ غير متوقع بالخادم', 
          fieldErrors: {}, key: Date.now() 
        };
      }
    },
    { success: false, error: null, fieldErrors: {}, key: 0 }
  );

  useEffect(() => {
    if (submitState.key === 0) return;
    if (submitState.success) onClose();
  }, [submitState.key, submitState.success, onClose]);

  const isMutating = isPending || createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" action={formAction} noValidate key={user?.id || 'new'}>
        <DialogTitle>{user ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}</DialogTitle>
        <DialogContent dividers>
          
          {submitState.error && (
            <Alert severity="error" sx={{ mb: 3 }}>{submitState.error}</Alert>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="username" label="اسم المستخدم *" fullWidth
                defaultValue={user?.username || ''}
                disabled={!!user}
                error={!!submitState.fieldErrors.username}
                helperText={submitState.fieldErrors.username}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="fullName" label="الاسم الكامل *" fullWidth
                defaultValue={user?.fullName || ''}
                error={!!submitState.fieldErrors.fullName}
                helperText={submitState.fieldErrors.fullName}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="email" type="email" label="البريد الإلكتروني" fullWidth
                defaultValue={user?.email || ''}
                error={!!submitState.fieldErrors.email}
                helperText={submitState.fieldErrors.email}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                name="role" select label="الدور *" fullWidth
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                error={!!submitState.fieldErrors.role}
                helperText={submitState.fieldErrors.role}
              >
                {Object.values(Role).map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {selectedRole === Role.ENGINEER && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="departmentId" select label="القسم *" fullWidth
                  defaultValue={user?.departmentId || ''}
                  error={!!submitState.fieldErrors.departmentId}
                  helperText={submitState.fieldErrors.departmentId}
                >
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.nameAr}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {!user && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="password" type="password" label="كلمة المرور المؤقتة *" fullWidth
                  error={!!submitState.fieldErrors.password}
                  helperText={submitState.fieldErrors.password || 'الحد الأدنى 8 أحرف'}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={onClose} disabled={isMutating} color="inherit">إلغاء</Button>
          <Button 
            type="submit" variant="contained" color="primary" 
            disabled={isMutating} startIcon={isMutating ? <CircularProgress size={20} color="inherit"/> : null}
          >
            {user ? 'حفظ التعديلات' : 'إضافة المستخدم'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};