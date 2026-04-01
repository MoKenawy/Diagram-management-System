// src/components/diagrams/constants.ts

import type { FileFormat } from '@/types/index';

interface FormatBadgeConfig {
  variant: string;
  className: string;
  icon: string;
}

export const FORMAT_BADGE_CONFIG: Record<FileFormat, FormatBadgeConfig> = {
  PDF: {
    variant: 'destructive',
    className: 'bg-red-100 text-red-700 border-red-200',
    icon: '📄',
  },
  DWG: {
    variant: 'default',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: '📐',
  },
  SVG: {
    variant: 'default',
    className: 'bg-green-100 text-green-700 border-green-200',
    icon: '🎨',
  },
  PNG: {
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: '🖼️',
  },
  JPEG: {
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: '🖼️',
  },
};