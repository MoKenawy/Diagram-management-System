// src/components/diagrams/EditMetadataForm.tsx
import { useState, useCallback, useEffect } from 'react';
import {
  Stack,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useUpdateDiagram } from '@/hooks/queries/useDiagramDetailQueries';
import type { DiagramDetailResponse } from '@/types/index';

interface EditMetadataFormProps {
  diagram: DiagramDetailResponse;
}

export const EditMetadataForm = ({ diagram }: EditMetadataFormProps) => {
  const [title, setTitle] = useState(diagram.title);
  const [description, setDescription] = useState(diagram.description ?? '');
  const [tags, setTags] = useState(diagram.tags.join(', '));
  const [saved, setSaved] = useState(false);

  const updateMutation = useUpdateDiagram(diagram.id);

  useEffect(() => {
    setTitle(diagram.title);
    setDescription(diagram.description ?? '');
    setTags(diagram.tags.join(', '));
  }, [diagram]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    setSaved(false);
    await updateMutation.mutateAsync({
      title: title || undefined,
      description: description || null,
      tags: tags,
    });
    setSaved(true);
  }, [title, description, tags, updateMutation]);

  return (
    <Stack spacing={2}>
      {updateMutation.isError && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          فشل تحديث البيانات
        </Alert>
      )}
      {saved && (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          تم الحفظ بنجاح
        </Alert>
      )}

      <TextField
        label="العنوان"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        size="small"
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />

      <TextField
        label="الوصف"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        multiline
        rows={3}
        size="small"
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />

      <TextField
        label="الوسوم (مفصولة بفواصل)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        fullWidth
        size="small"
        placeholder="كهرباء, طابق-2, مراجع"
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={updateMutation.isPending}
        startIcon={updateMutation.isPending ? <CircularProgress size={16} /> : null}
        sx={{ textTransform: 'none', borderRadius: 2, alignSelf: 'flex-end' }}
      >
        حفظ التغييرات
      </Button>
    </Stack>
  );
};