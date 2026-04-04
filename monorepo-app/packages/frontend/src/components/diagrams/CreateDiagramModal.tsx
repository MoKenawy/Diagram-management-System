import React, { useState, useActionState, startTransition, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Stepper, Step, StepLabel,
    Typography, TextField, Box, Autocomplete, Chip, Alert, LinearProgress, Divider,

} from '@mui/material';
import Grid from '@mui/material/Grid';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { createDiagramSchema } from '@/validations/diagramSchemas';
import type { CreateDiagramFormValues } from '@/validations/diagramSchemas';

import { useCreateDiagram } from '@/hooks/queries/useDiagramMutations';
import { useActiveDepartments } from '@/hooks/queries/useDepartmentQueries';
import { useSystemConfig } from '@/hooks/queries/useAdminQueries';
import { AccessManager } from '@/components/diagrams/AccessManager';





















const STEPS = ['الملف', 'البيانات الأساسية', 'الإصدار', 'المراجعة والرفع', 'الصلاحيات'];

interface CreateDiagramModalProps {
    open: boolean;
    onClose: () => void;
    onSuccessToast?: (msg: string) => void;
    onErrorToast?: (msg: string) => void;
}

// Added diagramId to ActionState so we can pass it to the AccessManager
type ActionState = { success: boolean; error: string | null; key: number; diagramId?: string };

const initialFormValues: Partial<CreateDiagramFormValues> = {
    tags: [],
    uploadDate: new Date(),
};

export const CreateDiagramModal: React.FC<CreateDiagramModalProps> = ({
    open, onClose, onSuccessToast, onErrorToast
}) => {
    const [activeStep, setActiveStep] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [createdDiagramId, setCreatedDiagramId] = useState<string | null>(null);

    const [formValues, setFormValues] = useState<Partial<CreateDiagramFormValues>>(initialFormValues);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { data: config } = useSystemConfig();
    const { data: departments = [] } = useActiveDepartments();
    const createDiagramMutation = useCreateDiagram();

    const maxUploadMb = config?.max_upload_size_mb ? parseInt(config.max_upload_size_mb) : 50;
    const maxBytes = maxUploadMb * 1024 * 1024;

    const [submitState, formAction, isPending] = useActionState<ActionState, Partial<CreateDiagramFormValues>>(
        async (_, payload) => {
            try {
                const validated = createDiagramSchema.parse(payload);

                const formData = new FormData();
                formData.append('file', validated.file);
                formData.append('title', validated.title);
                if (validated.description) formData.append('description', validated.description);
                formData.append('departmentId', validated.departmentId);
                if (validated.tags.length) formData.append('tags', validated.tags.join(','));
                formData.append('revisionLabel', validated.revisionLabel);
                formData.append('changeSummary', validated.changeSummary);

                const created = await createDiagramMutation.mutateAsync({
                    formData,
                    onProgress: setUploadProgress,
                });

                // We return the diagram ID to show the AccessManager next
                return { success: true, error: null, key: Date.now(), diagramId: created.diagram.id };
            } catch (err: any) {
                return { success: false, error: err.response?.data?.message || err.message || 'حدث خطأ أثناء الرفع', key: Date.now() };
            }
        },
        { success: false, error: null, key: 0 }
    );

    useEffect(() => {
        if (submitState.key === 0) return;

        if (submitState.success && submitState.diagramId) {
            onSuccessToast?.('تم إنشاء اللوحة بنجاح');
            setCreatedDiagramId(submitState.diagramId);
            setActiveStep(4); // Move to the Access Rules step
        } else if (submitState.error) {
            onErrorToast?.(submitState.error);
        }
    }, [submitState.key, submitState.diagramId, onSuccessToast, onErrorToast]);

    const validateCurrentStep = () => {
        let stepSchema;
        if (activeStep === 0) stepSchema = createDiagramSchema.pick({ file: true });
        else if (activeStep === 1) stepSchema = createDiagramSchema.pick({ title: true, departmentId: true });
        else if (activeStep === 2) stepSchema = createDiagramSchema.pick({ revisionLabel: true, changeSummary: true });
        else return true;

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

    const handleNext = () => {
        if (validateCurrentStep()) setActiveStep((prev) => prev + 1);
    };
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleResetAndClose = () => {
        setActiveStep(0);
        setUploadProgress(0);
        setCreatedDiagramId(null);
        setFormValues(initialFormValues);
        setFieldErrors({});
        onClose();
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

    const updateField = (field: keyof CreateDiagramFormValues, value: any) => {
        setFormValues(prev => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }));
    };

    return (
        <Dialog open={open} onClose={handleResetAndClose} maxWidth="md" fullWidth>
            <DialogTitle>رفع لوحة جديدة</DialogTitle>
            <DialogContent dividers sx={{ minHeight: '50vh' }}>
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    {STEPS.map((label, idx) => (
                        <Step key={label} completed={idx < activeStep}>
                            <StepLabel
                                onClick={() => idx < activeStep && !createdDiagramId && setActiveStep(idx)}
                                sx={{ cursor: (idx < activeStep && !createdDiagramId) ? 'pointer' : 'default' }}
                            >
                                {label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box component="form" noValidate>
                    {activeStep === 0 && (
                        <Box sx={{ p: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>أقصى حجم للملف: {maxUploadMb}MB</Typography>
                            <Box
                                {...getRootProps()}
                                sx={{
                                    border: '2px dashed',
                                    borderColor: isDragReject || fieldErrors.file ? 'error.main' : 'primary.main',
                                    borderRadius: 2, p: 4, textAlign: 'center', cursor: 'pointer',
                                    bgcolor: 'background.default'
                                }}
                            >
                                <input {...getInputProps()} />
                                <InsertDriveFileIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                                <Typography>اسحب وأفلت الملف هنا، أو انقر للاختيار</Typography>
                                <Typography variant="caption" color="textSecondary">(PDF, JPEG, PNG, SVG, DWG)</Typography>
                            </Box>
                            {fieldErrors.file && <Typography color="error" variant="caption" sx={{ mt: 1 }}>{fieldErrors.file}</Typography>}
                            {formValues.file && (
                                <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mt: 2 }}>
                                    {formValues.file.name} - {(formValues.file.size / 1024 / 1024).toFixed(2)} MB
                                </Alert>
                            )}
                        </Box>
                    )}

                    {activeStep === 1 && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <TextField label="عنوان اللوحة *" fullWidth value={formValues.title || ''} onChange={(e) => updateField('title', e.target.value)} error={!!fieldErrors.title} helperText={fieldErrors.title} />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="القسم المالك *"
                                    value={formValues.departmentId || ''}
                                    onChange={(e) => updateField('departmentId', e.target.value)}
                                    error={!!fieldErrors.departmentId}
                                    helperText={fieldErrors.departmentId}
                                    slotProps={{
                                        select: {
                                            native: true,
                                        },
                                    }}
                                >
                                    <option value=""></option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.nameAr}
                                        </option>
                                    ))}
                                </TextField>

                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField label="الوصف" fullWidth multiline rows={3} value={formValues.description || ''} onChange={(e) => updateField('description', e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Autocomplete multiple freeSolo options={[]} value={formValues.tags} onChange={(_, newValue) => updateField('tags', newValue)} renderTags={(value: readonly string[], getTagProps) => value.map((option: string, index: number) => (<Chip variant="outlined" label={option} {...getTagProps({ index })} />))} renderInput={(params) => <TextField {...params} label="الوسوم (اختياري)" placeholder="اضغط Enter للإضافة" />} />
                            </Grid>
                        </Grid>
                    )}

                    {activeStep === 2 && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField label="رقم الإصدار *" placeholder="Rev A" fullWidth value={formValues.revisionLabel || ''} onChange={(e) => updateField('revisionLabel', e.target.value)} error={!!fieldErrors.revisionLabel} helperText={fieldErrors.revisionLabel} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField type="date" label="تاريخ الرفع" fullWidth disabled InputLabelProps={{ shrink: true }} value={formValues.uploadDate?.toISOString().split('T')[0] || ''} />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField label="ملخص التغييرات *" placeholder="الوصف الأول للمستند" fullWidth multiline rows={3} value={formValues.changeSummary || ''} onChange={(e) => updateField('changeSummary', e.target.value)} error={!!fieldErrors.changeSummary} helperText={fieldErrors.changeSummary} />
                            </Grid>
                        </Grid>
                    )}

                    {activeStep === 3 && (
                        <Box>
                            <Typography variant="h6" gutterBottom>مراجعة البيانات قبل الرفع</Typography><Divider sx={{ mb: 2 }} />
                            <Typography><strong>الملف:</strong> {formValues.file?.name}</Typography>
                            <Typography><strong>العنوان:</strong> {formValues.title}</Typography>
                            <Typography><strong>القسم:</strong> {departments.find(d => d.id === formValues.departmentId)?.nameAr}</Typography>
                            <Typography><strong>الإصدار:</strong> {formValues.revisionLabel}</Typography>

                            {isPending && (
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="caption" color="textSecondary">جاري الرفع... {uploadProgress}%</Typography>
                                    <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 1 }} />
                                </Box>
                            )}
                        </Box>
                    )}

                    {activeStep === 4 && createdDiagramId && (
                        <Box>
                            <Alert severity="success" sx={{ mb: 3 }}>
                                تم رفع اللوحة بنجاح. يمكنك الآن إضافة قواعد الوصول.
                            </Alert>
                            <AccessManager diagramId={createdDiagramId} />
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                {/* If diagram is successfully created (Step 4), we only show "Finish" */}
                {activeStep === 4 ? (
                    <Button variant="contained" color="primary" onClick={handleResetAndClose}>
                        إنهاء
                    </Button>
                ) : (
                    <>
                        <Button onClick={handleResetAndClose} disabled={isPending}>إلغاء</Button>
                        <Box sx={{ flexGrow: 1 }} />
                        <Button disabled={activeStep === 0 || isPending} onClick={handleBack}>السابق</Button>

                        {activeStep < 3 ? (
                            <Button variant="contained" onClick={handleNext}>التالي</Button>
                        ) : (
                            <Button variant="contained" color="primary" onClick={() => startTransition(() => formAction(formValues))} disabled={isPending}>
                                تأكيد ورفع
                            </Button>
                        )}
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};