// src/components/diagrams/AccessManager.tsx
import { useState, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  
} from '@mui/material';
import { Delete, Person, Business, Add } from '@mui/icons-material';
import {
  useDiagramAccessRules,
  useDeleteAccessRule,
} from '@/hooks/queries/useDiagramDetailQueries';
import { AccessRuleForm } from '@/components/diagrams/AccessRuleForm';
import type { DiagramAccessRuleResponse } from '@/types/index';

interface AccessManagerProps {
  diagramId: string;
}

const POLICY_CONFIG = {
  ALLOW: { label: 'سماح', color: 'success' as const },
  DENY: { label: 'حظر', color: 'error' as const },
} as const;

const LEVEL_CONFIG = {
  VIEW: { label: 'عرض' },
  ADMIN: { label: 'مدير' },
  UPDATE: { label: 'تعديل' },
  CREATE: { label: 'إنشاء' },
  DELETE: { label: 'حذف' },

} as const;

const SKELETON_ROWS = 3;

export const AccessManager = ({ diagramId }: AccessManagerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DiagramAccessRuleResponse | null>(null);

  const { data: rules, isLoading } = useDiagramAccessRules(diagramId);
  const deleteMutation = useDeleteAccessRule(diagramId);

  const handleConfirmDelete = useCallback(async (): Promise<void> => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteMutation]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle2" fontWeight={600}>
          قواعد الوصول
        </Typography>
        <Button
          size="small"
          startIcon={<Add />}
          onClick={() => setShowForm(true)}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          إضافة قاعدة وصول
        </Button>
      </Box>

      {/* Inline Add Form */}
      {showForm && (
        <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 3 }}>
          <AccessRuleForm
            diagramId={diagramId}
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </Box>
      )}

      {/* Rules Table */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e0e0e0' }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#fafafa' }}>
              <TableCell align="right">النوع</TableCell>
              <TableCell align="right">الهدف</TableCell>
              <TableCell align="right">المستوى</TableCell>
              <TableCell align="right">السياسة</TableCell>
              <TableCell align="right">إجراء</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: SKELETON_ROWS }, (_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }, (_, j) => (
                    <TableCell key={j} align="right">
                      <Skeleton width={60} height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rules && rules.length > 0 ? (
              rules.map((rule) => (
                <TableRow key={rule.id} hover>
                  <TableCell align="right">
                    {rule.targetType === 'USER' ? (
                      <Person fontSize="small" color="action" />
                    ) : (
                      <Business fontSize="small" color="action" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">{rule.targetName ?? rule.targetId}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={LEVEL_CONFIG[rule.accessLevel].label}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 2, fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={POLICY_CONFIG[rule.policy].label}
                      size="small"
                      color={POLICY_CONFIG[rule.policy].color}
                      sx={{ borderRadius: 2, fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => setDeleteTarget(rule)} color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.disabled" py={2}>
                    لا توجد قواعد وصول
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل تريد حذف قاعدة الوصول لـ "{deleteTarget?.targetName}"؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} sx={{ textTransform: 'none' }}>
            إلغاء
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};