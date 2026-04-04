import React, { useState, useEffect, useActionState, startTransition } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stepper, Step, StepLabel,
  Typography, TextField, Box, Grid, Alert, LinearProgress
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { uploadRevisionSchema } from '@/validations/diagramSchemas';
import type { UploadRevisionFormValues } from '@/validations/diagramSchemas';

import { useCreateDiagramVersion } from '@/hooks/queries/useDiagramMutations';
import { useSystemConfig } from '@/hooks/queries/useAdminQueries';



const STEPS = ['الملف', 'بيانات الإصدار'];

interface UploadRevisionModalProps {
  open: boolean; // Changed from isOpen
  diagramId: string;
  diagramTitle: string;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void; // Made optional
  onErrorToast?: (msg: string) => void; // Made optional
}

type ActionState = { success: boolean; error: string | null; key: number };

export const UploadRevisionModal: React.FC<UploadRevisionModalProps> = ({
  open, diagramId, diagramTitle, onClose, onSuccessToast, onErrorToast
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formValues, setFormValues] = useState<Partial<UploadRevisionFormValues>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { data: config } = useSystemConfig();
  const createVersionMutation = useCreateDiagramVersion();

  const maxUploadMb = config?.max_upload_size_mb ? parseInt(config.max_upload_size_mb) : 50;
  const maxBytes = maxUploadMb * 1024 * 1024;

  const [submitState, formAction, isPending] = useActionState<ActionState, Partial<UploadRevisionFormValues>>(
    async (_, payload) => {
      try {
        const validated = uploadRevisionSchema.parse(payload);
        
        const formData = new FormData();
        formData.append('file', validated.file);
        formData.append('revisionLabel', validated.revisionLabel);
        formData.append('changeSummary', validated.changeSummary);

        await createVersionMutation.mutateAsync({
          diagramId,
          formData,
          onProgress: setUploadProgress,
        });

        return { success: true, error: null, key: Date.now() };
      } catch (err: any) {
        return { success: false, error: err.response?.data?.message || err.message || 'حدث خطأ أثناء الرفع', key: Date.now() };
      }
    },
    { success: false, error: null, key: 0 }
  );

  useEffect(() => {
    if (submitState.key === 0) return;
    
    if (submitState.success) {
      onSuccessToast?.('تم رفع الإصدار الجديد');
      handleResetAndClose();
    } else if (submitState.error) {
      onErrorToast?.(submitState.error);
    }
  }, [submitState.key, onSuccessToast, onErrorToast]);

  const validateCurrentStep = () => {
    const stepSchema = activeStep === 0 
      ? uploadRevisionSchema.pick({ file: true })
      : uploadRevisionSchema.pick({ revisionLabel: true, changeSummary: true });

    const result = stepSchema.safeParse(formValues);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(issue => { errors[issue.path[0] as string] = issue.message; });
      setFieldErrors(errors);
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const handleNext = () => { if (validateCurrentStep()) setActiveStep((prev) => prev + 1); };
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleResetAndClose = () => {
    setActiveStep(0);
    setUploadProgress(0);
    setFormValues({});
    setFieldErrors({});
    onClose();
  };

  const updateField = (field: keyof UploadRevisionFormValues, value: any) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    maxSize: maxBytes,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/svg+xml': ['.svg'],
      'image/vnd.dwg': ['.dwg'],
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length) {
        setFormValues(prev => ({ ...prev, file: acceptedFiles[0] }));
        setFieldErrors(prev => ({ ...prev, file: '' }));
      }
    }
  });

  return (
    <Dialog open={open} onClose={handleResetAndClose} maxWidth="sm" fullWidth>
      <DialogTitle>رفع إصدار جديد</DialogTitle>
      
      <DialogContent dividers>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          اللوحة: <strong>{diagramTitle}</strong>
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {STEPS.map((label, idx) => (<Step key={label} completed={idx < activeStep}><StepLabel>{label}</StepLabel></Step>))}
        </Stepper>
        
        <Box component="form" noValidate>
          {activeStep === 0 && (
            <Box sx={{ p: 2 }}>
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed', borderColor: isDragReject || fieldErrors.file ? 'error.main' : 'primary.main',
                  borderRadius: 2, p: 4, textAlign: 'center', cursor: 'pointer', bgcolor: 'background.default'
                }}
              >
                <input {...getInputProps()} />
                <InsertDriveFileIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                <Typography>اسحب وأفلت ملف الإصدار الجديد هنا</Typography>
              </Box>
              {fieldErrors.file && <Typography color="error" variant="caption" sx={{ mt: 1 }}>{fieldErrors.file}</Typography>}
              {formValues.file && (<Alert icon={<CheckCircleIcon />} severity="success" sx={{ mt: 2 }}>{formValues.file.name}</Alert>)}
            </Box>
          )}

          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField label="رقم الإصدار الجديد *" fullWidth value={formValues.revisionLabel || ''} onChange={(e) => updateField('revisionLabel', e.target.value)} error={!!fieldErrors.revisionLabel} helperText={fieldErrors.revisionLabel} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="ملخص التغييرات *" multiline rows={3} fullWidth value={formValues.changeSummary || ''} onChange={(e) => updateField('changeSummary', e.target.value)} error={!!fieldErrors.changeSummary} helperText={fieldErrors.changeSummary} />
              </Grid>
              {isPending && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="textSecondary">جاري الرفع... {uploadProgress}%</Typography>
                  <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 1 }} />
                </Grid>
              )}
            </Grid>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleResetAndClose} disabled={isPending}>إلغاء</Button>
        <Box sx={{ flexGrow: 1 }} />
        {activeStep === 1 && (<Button disabled={isPending} onClick={handleBack}>السابق</Button>)}
        {activeStep === 0 ? (<Button variant="contained" onClick={handleNext}>التالي</Button>) : (<Button variant="contained" color="primary" onClick={() => startTransition(() => formAction(formValues))} disabled={isPending}>تأكيد ورفع</Button>)}
      </DialogActions>
    </Dialog>
  );
};