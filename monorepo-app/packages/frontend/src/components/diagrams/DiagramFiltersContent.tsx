// src/components/diagrams/DiagramFiltersContent.tsx
import {
  Box,
  Typography,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  TextField,
  Stack,
} from '@mui/material';
import { FilterAltOff } from '@mui/icons-material';
import { FilterFormatCheckbox } from './FilterFormatCheckbox';
import { FileFormat, Role, type DepartmentBasic } from '@/types/index';

const ALL_FORMATS: FileFormat[] = [
  FileFormat.PDF,
  FileFormat.DWG,
  FileFormat.SVG,
  FileFormat.PNG,
  FileFormat.JPEG,
];

const PRIVILEGED_ROLES: Role[] = [Role.DC, Role.ADMIN];

interface DiagramFiltersContentProps {
  selectedFormats: FileFormat[];
  selectedDepartments: string[];
  uploadedFrom: string;
  uploadedTo: string;
  departments: DepartmentBasic[];
  userRole: Role;
  hasActiveFilters: boolean;
  onToggleFormat: (format: FileFormat) => void;
  onDepartmentsChange: (ids: string[]) => void;
  onDateChange: (from?: string, to?: string) => void;
  onClear: () => void;
}

export const DiagramFiltersContent = ({
  selectedFormats,
  selectedDepartments,
  uploadedFrom,
  uploadedTo,
  departments,
  userRole,
  hasActiveFilters,
  onToggleFormat,
  onDepartmentsChange,
  onDateChange,
  onClear,
}: DiagramFiltersContentProps) => {
  const showDepartments = PRIVILEGED_ROLES.includes(userRole);

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={600}>
          التصفية
        </Typography>
        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<FilterAltOff />}
            onClick={onClear}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            مسح الفلاتر
          </Button>
        )}
      </Box>

      {/* File Formats */}
      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
        نوع الملف
      </Typography>
      <Stack spacing={0} mb={2}>
        {ALL_FORMATS.map((format) => (
          <FilterFormatCheckbox
            key={format}
            format={format}
            checked={selectedFormats.includes(format)}
            onChange={onToggleFormat}
          />
        ))}
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Date Range */}
      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
        تاريخ الرفع
      </Typography>
      <Stack spacing={1.5} mb={2}>
        <TextField
          label="من"
          type="date"
          size="small"
          fullWidth
          value={uploadedFrom}
          onChange={(e) => onDateChange(e.target.value , uploadedTo )}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <TextField
          label="إلى"
          type="date"
          size="small"
          fullWidth
          value={uploadedTo}
          onChange={(e) => onDateChange(uploadedFrom || undefined, e.target.value || undefined)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      </Stack>

      {/* Departments (DC/ADMIN only) */}
      {showDepartments && (
        <>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            القسم
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>الأقسام</InputLabel>
            <Select
              multiple
              value={selectedDepartments}
              onChange={(e) => onDepartmentsChange(e.target.value as string[])}
              input={<OutlinedInput label="الأقسام" />}
              renderValue={(selected) => (
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {selected.map((id) => {
                    const dept = departments.find((d) => d.id === id);
                    return (
                      <Chip
                        key={id}
                        label={dept?.nameAr ?? id}
                        size="small"
                        sx={{ borderRadius: 1.5 }}
                      />
                    );
                  })}
                </Box>
              )}
              sx={{ borderRadius: 2 }}
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.nameAr} ({dept.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}
    </Box>
  );
};