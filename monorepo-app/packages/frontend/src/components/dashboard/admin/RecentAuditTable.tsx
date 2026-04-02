// src/components/dashboard/admin/RecentAuditTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Skeleton,
  Box,
} from '@mui/material';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { formatTimeAgo } from '@/utils/formatters';
import type { AuditLogEntry } from '@/types/index';

interface RecentAuditTableProps {
  entries: AuditLogEntry[];
  isLoading: boolean;
}

const ACTION_COLORS: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  DIAGRAM_CREATED: 'success',
  VERSION_UPLOADED: 'info',
  DIAGRAM_DOWNLOADED: 'info',
  USER_CREATED: 'success',
  USER_UPDATED: 'warning',
  DIAGRAM_DEACTIVATED: 'error',
  BACKUP_TRIGGERED: 'warning',
  RESTORE_TRIGGERED: 'error',
};

const SKELETON_ROWS = 5;

export const RecentAuditTable = ({ entries, isLoading }: RecentAuditTableProps) => (
  <Box>
    <SectionHeader title="آخر الأحداث" />

    <TableContainer
      component={Paper}
      sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e0e0e0' }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#fafafa' }}>
            <TableCell align="right">الوقت</TableCell>
            <TableCell align="right">المستخدم</TableCell>
            <TableCell align="right">الإجراء</TableCell>
            <TableCell align="right">النوع</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading
            ? Array.from({ length: SKELETON_ROWS }, (_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }, (_, j) => (
                    <TableCell key={j} align="right">
                      <Skeleton width={80} height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : entries.map((entry) => (
                <TableRow key={entry.id} hover>
                  <TableCell align="right">{formatTimeAgo(entry.occurredAt)}</TableCell>
                  <TableCell align="right">
                    {entry.user?.username ?? 'النظام'}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={entry.action}
                      size="small"
                      color={ACTION_COLORS[entry.action] ?? 'default'}
                      variant="outlined"
                      sx={{ borderRadius: 2, fontFamily: 'monospace', fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {entry.targetType ?? '-'}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);