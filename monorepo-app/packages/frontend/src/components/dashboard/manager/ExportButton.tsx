// src/components/dashboard/manager/ExportButton.tsx
import { Button, CircularProgress } from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import type { ReportExportFormat } from '@/types/index';

interface ExportButtonProps {
  onExport: (format: ReportExportFormat) => void;
  isExporting: boolean;
  format: ReportExportFormat;
  label: string;
}

export const ExportButton = ({ onExport, isExporting, format, label }: ExportButtonProps) => (
  <Button
    variant="outlined"
    size="small"
    startIcon={isExporting ? <CircularProgress size={16} /> : <FileDownload />}
    disabled={isExporting}
    onClick={() => onExport(format)}
    sx={{ borderRadius: 2, textTransform: 'none' }}
  >
    {label}
  </Button>
);