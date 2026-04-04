// src/components/diagrams/DeactivateSection.tsx
import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DeleteForever } from '@mui/icons-material';
import { useDeactivateDiagram } from '@/hooks/queries/useDiagramDetailQueries';

interface DeactivateSectionProps {
  diagramId: string;
  diagramTitle: string;
  onDeactivated: () => void;
}

export const DeactivateSection = ({
  diagramId,
  diagramTitle,
  onDeactivated,
}: DeactivateSectionProps) => {
  const [open, setOpen] = useState(false);
  const deactivateMutation = useDeactivateDiagram(diagramId);

  const handleConfirm = useCallback(async (): Promise<void> => {
    await deactivateMutation.mutateAsync();
    setOpen(false);
    onDeactivated();
  }, [deactivateMutation, onDeactivated]);

  return (
    <Box
      sx={{
        p: 3,
        border: '1px solid #ffcdd2',
        borderRadius: 3,
        backgroundColor: '#fff5f5',
      }}
    >
      <Typography variant="subtitle2" color="error" fontWeight={600} gutterBottom>
        منطقة الخطر
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        سيتم تعطيل هذه اللوحة ولن تظهر في الأرشيف. يمكن إعادة تفعيلها لاحقاً.
      </Typography>
      <Button
        variant="outlined"
        color="error"
        startIcon={<DeleteForever />}
        onClick={() => setOpen(true)}
        sx={{ textTransform: 'none', borderRadius: 2 }}
      >
        إلغاء تفعيل اللوحة
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>تأكيد إلغاء التفعيل</DialogTitle>
        <DialogContent>
          {deactivateMutation.isError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              فشل إلغاء التفعيل
            </Alert>
          )}
          <Typography>
            هل أنت متأكد من إلغاء تفعيل "{diagramTitle}"؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>
            إلغاء
          </Button>
          <Button
            onClick={handleConfirm}
            color="error"
            variant="contained"
            disabled={deactivateMutation.isPending}
            startIcon={deactivateMutation.isPending ? <CircularProgress size={16} /> : null}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            تأكيد
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};