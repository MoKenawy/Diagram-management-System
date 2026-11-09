// src/components/diagrams/CreateDiagramForm.tsx
import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';

import type { DepartmentBasic } from '@/types/index';
import { useCreateDiagramForm } from '@/hooks/useCreateDiagramForm';
import {
  ACCEPTED_FILE_EXTENSIONS,
  MAX_FILE_SIZE_MB,
} from '@/validations/diagramCreateSchema';

interface CreateDiagramFormProps {
  departments: DepartmentBasic[];
  departmentsLoading: boolean;
  onCancel: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const CreateDiagramForm = ({
  departments,
  departmentsLoading,
  onCancel,
}: CreateDiagramFormProps) => {
  const {
    values,
    errors,
    isSubmitting,
    serverError,
    setField,
    clearError,
    handleSubmit,
    reset,
  } = useCreateDiagramForm();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelected = (file: File | null | undefined) => {
    if (!file) return;
    setField('file', file);
    clearError('file');
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    handleFileSelected(event.dataTransfer.files?.[0]);
  };

  const onFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFileSelected(event.target.files?.[0]);
    // Reset so picking the same file twice fires onChange again.
    event.target.value = '';
  };

  const removeFile = () => {
    setField('file', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    void handleSubmit(event);
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    reset();
    onCancel();
  };

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 } }}>
      <Box component="form" onSubmit={submit} noValidate>
        <Stack spacing={3}>
          {serverError && (
            <Alert severity="error" variant="filled">
              {serverError}
            </Alert>
          )}

          <TextField
            label="Title"
            required
            fullWidth
            value={values.title}
            onChange={(e) => {
              setField('title', e.target.value);
              clearError('title');
            }}
            error={!!errors.title}
            helperText={errors.title}
            disabled={isSubmitting}
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={3}
            value={values.description}
            onChange={(e) => {
              setField('description', e.target.value);
              clearError('description');
            }}
            error={!!errors.description}
            helperText={
              errors.description ?? 'Optional. Briefly describe what this diagram represents.'
            }
            disabled={isSubmitting}
          />

          <FormControl
            fullWidth
            error={!!errors.departmentId}
            disabled={isSubmitting || departmentsLoading}
          >
            <InputLabel id="create-diagram-department-label">Department</InputLabel>
            <Select
              labelId="create-diagram-department-label"
              label="Department"
              value={values.departmentId}
              onChange={(e) => {
                setField('departmentId', e.target.value);
                clearError('departmentId');
              }}
            >
              {departmentsLoading && (
                <MenuItem value="" disabled>
                  <em>Loading…</em>
                </MenuItem>
              )}
              {!departmentsLoading && departments.length === 0 && (
                <MenuItem value="" disabled>
                  <em>No departments available</em>
                </MenuItem>
              )}
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.nameEn} ({dept.code})
                </MenuItem>
              ))}
            </Select>
            {errors.departmentId && <FormHelperText>{errors.departmentId}</FormHelperText>}
          </FormControl>

          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={values.tags}
            onChange={(_, newValue) => {
              setField('tags', newValue);
              clearError('tags');
            }}
            disabled={isSubmitting}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return <Chip label={option} size="small" {...tagProps} key={key} />;
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags"
                placeholder="Type a tag and press Enter"
                error={!!errors.tags}
                helperText={errors.tags ?? 'Optional. Press Enter to add each tag.'}
              />
  )}
          />

          <TextField
            label="Revision label"
            required
            fullWidth
            placeholder="e.g. Rev A, 1.0"
            value={values.revisionLabel}
            onChange={(e) => {
              setField('revisionLabel', e.target.value);
              clearError('revisionLabel');
            }}
            error={!!errors.revisionLabel}
            helperText={errors.revisionLabel}
            disabled={isSubmitting}
          />

          <TextField
            label="Change summary"
            required
            fullWidth
            multiline
            minRows={3}
            value={values.changeSummary}
            onChange={(e) => {
              setField('changeSummary', e.target.value);
              clearError('changeSummary');
            }}
            error={!!errors.changeSummary}
            helperText={
              errors.changeSummary ??
              'Describe what this version contains or how it differs from prior revisions.'
            }
            disabled={isSubmitting}
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Diagram file
            </Typography>

            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept={ACCEPTED_FILE_EXTENSIONS.join(',')}
              onChange={onFileInputChange}
            />

            {!values.file ? (
              <Box
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                sx={{
                  border: '2px dashed',
                  borderColor: dragOver
                    ? 'primary.main'
                    : errors.file
                      ? 'error.main'
                      : 'divider',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: dragOver ? 'action.hover' : 'background.paper',
                  transition: 'border-color 0.2s, background-color 0.2s',
                }}
              >
                <Stack spacing={1} alignItems="center">
                  <CloudUploadIcon
                    color={errors.file ? 'error' : 'action'}
                    sx={{ fontSize: 40 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Drag and drop the file here, or{' '}
                    <Box
                      component="span"
                      sx={{ color: 'primary.main', textDecoration: 'underline' }}
                    >
                      browse
                    </Box>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Allowed: {ACCEPTED_FILE_EXTENSIONS.join(', ')} · up to {MAX_FILE_SIZE_MB} MB
                  </Typography>
                </Stack>
              </Box>
            ) : (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <InsertDriveFileIcon color="action" />
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {values.file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(values.file.size)}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<CloseIcon />}
                    onClick={removeFile}
                    disabled={isSubmitting}
                  >
                    Remove
                  </Button>
                </Stack>
              </Paper>
            )}

            {errors.file && (
              <FormHelperText error sx={{ mt: 1 }}>
                {errors.file}
              </FormHelperText>
            )}
          </Box>

          <Divider />

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button
              type="button"
              variant="outlined"
              color="inherit"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {isSubmitting ? 'Uploading…' : 'Create diagram'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};
