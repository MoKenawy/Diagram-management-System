// src/components/diagrams/AccessRuleForm.tsx
import { useState, useCallback } from 'react';
import {
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  useCreateAccessRule,
  useActiveEngineers,
  useActiveDepartmentsForAccess,
} from '@/hooks/queries/useDiagramDetailQueries';
import type {
  TargetType,
  AccessLevel,
  AccessPolicy,
  DiagramAccessRuleCreateRequest,
} from '@/types/index';

interface AccessRuleFormProps {
  diagramId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AccessRuleForm = ({ diagramId, onSuccess, onCancel }: AccessRuleFormProps) => {
  const [targetType, setTargetType] = useState<TargetType>('USER');
  const [targetId, setTargetId] = useState('');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('VIEW');
  const [policy, setPolicy] = useState<AccessPolicy>('ALLOW');

  const { data: engineers = [] } = useActiveEngineers();
  const { data: departments = [] } = useActiveDepartmentsForAccess();
  const createMutation = useCreateAccessRule(diagramId);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!targetId) return;

    const payload: DiagramAccessRuleCreateRequest = {
      targetType,
      targetId,
      accessLevel,
      policy,
    };

    await createMutation.mutateAsync(payload);
    onSuccess();
  }, [targetType, targetId, accessLevel, policy, createMutation, onSuccess]);

  const isValid: boolean = !!targetId;

  return (
    <Stack spacing={2}>
      {createMutation.isError && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {(createMutation.error as Error)?.message ?? 'فشل إضافة القاعدة'}
        </Alert>
      )}

      {/* Target Type */}
      <ToggleButtonGroup
        value={targetType}
        exclusive
        onChange={(_, val: TargetType | null) => {
          if (val) {
            setTargetType(val);
            setTargetId('');
          }
        }}
        size="small"
        fullWidth
      >
        <ToggleButton value="USER" sx={{ borderRadius: 2, textTransform: 'none' }}>
          مستخدم
        </ToggleButton>
        <ToggleButton value="DEPARTMENT" sx={{ borderRadius: 2, textTransform: 'none' }}>
          قسم
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Target Select */}
      <FormControl fullWidth size="small">
        <InputLabel>{targetType === 'USER' ? 'المستخدم' : 'القسم'}</InputLabel>
        <Select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          label={targetType === 'USER' ? 'المستخدم' : 'القسم'}
          sx={{ borderRadius: 2 }}
        >
          {targetType === 'USER'
            ? engineers.map((eng) => (
                <MenuItem key={eng.id} value={eng.id}>
                  {eng.fullName} ({eng.username})
                </MenuItem>
              ))
            : departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.nameAr} ({dept.code})
                </MenuItem>
              ))}
        </Select>
      </FormControl>

      {/* Access Level */}
      <FormControl fullWidth size="small">
        <InputLabel>المستوى</InputLabel>
        <Select
          value={accessLevel}
          onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
          label="المستوى"
          sx={{ borderRadius: 2 }}
        >
          <MenuItem value="VIEW">عرض</MenuItem>
          <MenuItem value="EDIT">تعديل</MenuItem>
          <MenuItem value="ADMIN">مدير</MenuItem>
        </Select>
      </FormControl>

      {/* Policy */}
      <ToggleButtonGroup
        value={policy}
        exclusive
        onChange={(_, val: AccessPolicy | null) => { if (val) setPolicy(val); }}
        size="small"
        fullWidth
      >
        <ToggleButton value="ALLOW" sx={{ borderRadius: 2, textTransform: 'none', color: '#2e7d32' }}>
          سماح
        </ToggleButton>
        <ToggleButton value="DENY" sx={{ borderRadius: 2, textTransform: 'none', color: '#d32f2f' }}>
          حظر
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Actions */}
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button onClick={onCancel} sx={{ textTransform: 'none', borderRadius: 2 }}>
          إلغاء
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || createMutation.isPending}
          startIcon={createMutation.isPending ? <CircularProgress size={16} /> : null}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          إضافة
        </Button>
      </Stack>
    </Stack>
  );
};