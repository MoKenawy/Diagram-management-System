import React, { useEffect, useActionState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, Alert, Typography, CircularProgress
} from '@mui/material';
import { useResetPassword } from '@/hooks/queries/useAdminQueries';

interface PasswordResetModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  username: string;
}

type ResetActionState = {
  success: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  key: number;
};

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ open, onClose, userId, username }) => {
  const resetMutation = useResetPassword();

  // Notice the explicit return type: Promise<ResetActionState>
  const [submitState, formAction, isPending] = useActionState<ResetActionState, FormData>(
    async (_, formData): Promise<ResetActionState> => {
      const newPassword = formData.get('newPassword') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      const fieldErrors: Record<string, string> = {};
      
      if (!newPassword || newPassword.length < 8) {
        fieldErrors.newPassword = 'كلمة المرور يجب أن تتكون من 8 أحرف على الأقل';
      }
      if (newPassword !== confirmPassword) {
        fieldErrors.confirmPassword = 'كلمات المرور غير متطابقة';
      }

      if (Object.keys(fieldErrors).length > 0) {
        return { success: false, error: null, fieldErrors, key: Date.now() };
      }

      try {
        await resetMutation.mutateAsync({
          id: userId,
          data: { newPassword }
        });
        return { success: true, error: null, fieldErrors: {}, key: Date.now() };
      } catch (err: any) {
        return { 
          success: false, 
          error: err.response?.data?.message || err.message || 'حدث خطأ أثناء تغيير كلمة المرور', 
          fieldErrors: {}, key: Date.now() 
        };
      }
    },
    { success: false, error: null, fieldErrors: {}, key: 0 }
  );

  useEffect(() => {
    if (submitState.key === 0) return;
    if (submitState.success) {
      alert('تم إعادة تعيين كلمة المرور بنجاح.');
      onClose();
    }
  }, [submitState.key, submitState.success, onClose]);

  const isMutating = isPending || resetMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" action={formAction} noValidate key={userId}>
        <DialogTitle>إعادة تعيين كلمة المرور</DialogTitle>
        <DialogContent dividers>
          
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            أنت تقوم بتغيير كلمة المرور للمستخدم: <strong>{username}</strong>
          </Typography>

          {submitState.error && (
            <Alert severity="error" sx={{ mb: 3 }}>{submitState.error}</Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              name="newPassword" type="password" label="كلمة المرور الجديدة" fullWidth required
              error={!!submitState.fieldErrors.newPassword}
              helperText={submitState.fieldErrors.newPassword}
            />
            <TextField
              name="confirmPassword" type="password" label="تأكيد كلمة المرور" fullWidth required
              error={!!submitState.fieldErrors.confirmPassword}
              helperText={submitState.fieldErrors.confirmPassword}
            />
          </Box>

        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={onClose} disabled={isMutating} color="inherit">إلغاء</Button>
          <Button 
            type="submit" variant="contained" color="primary" 
            disabled={isMutating} startIcon={isMutating ? <CircularProgress size={20} color="inherit"/> : null}
          >
            حفظ كلمة المرور
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};