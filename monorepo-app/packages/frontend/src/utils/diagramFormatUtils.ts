// src/utils/diagramFormatUtils.ts
import type { FileFormat } from '@/types/index';

interface FormatConfig {
  label: string;
  color: string;
  bgColor: string;
}

const FORMAT_CONFIG: Record<FileFormat, FormatConfig> = {
  PDF: { label: 'PDF', color: '#d32f2f', bgColor: '#ffebee' },
  DWG: { label: 'DWG', color: '#1565c0', bgColor: '#e3f2fd' },
  SVG: { label: 'SVG', color: '#0059bb', bgColor: '#f9f9ff' },
  PNG: { label: 'PNG', color: '#616161', bgColor: '#f5f5f5' },
  JPEG: { label: 'JPEG', color: '#616161', bgColor: '#f5f5f5' },
};

export const getFormatConfig = (format: FileFormat): FormatConfig =>
  FORMAT_CONFIG[format] ?? FORMAT_CONFIG.PDF;

export const getThumbnailUrl = (diagramId: string, versionId: string | null | undefined): string | null =>
  versionId ? `/api/diagrams/${diagramId}/versions/${versionId}/thumbnail` : null;

export const getDownloadUrl = (diagramId: string, versionId: string): string =>
  `/api/diagrams/${diagramId}/versions/${versionId}/file`;