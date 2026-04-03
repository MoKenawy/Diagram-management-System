// src/components/diagrams/FormatBadge.tsx
import { Chip } from '@mui/material';
import type { FileFormat } from '@/types/index';
import { getFormatConfig } from '@/utils/diagramFormatUtils';

interface FormatBadgeProps {
  format: FileFormat;
}

export const FormatBadge = ({ format }: FormatBadgeProps) => {
  const config = getFormatConfig(format);

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: 11,
        color: config.color,
        backgroundColor: config.bgColor,
        borderRadius: 2,
        height: 22,
      }}
    />
  );
};