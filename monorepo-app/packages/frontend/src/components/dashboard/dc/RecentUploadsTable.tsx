// src/components/dashboard/dc/RecentUploadsTable.tsx
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
  Avatar,
} from '@mui/material';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { formatTimeAgo } from '@/utils/formatters';
import type { DiagramSummaryResponse } from '@/types/index';

interface RecentUploadsTableProps {
  diagrams: DiagramSummaryResponse[];
  isLoading: boolean;
}

const SKELETON_ROWS = 5;

export const RecentUploadsTable = ({ diagrams, isLoading }: RecentUploadsTableProps) => (
  <Box>
    <SectionHeader title="آخر الرفعات" />

    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#fafafa' }}>
            <TableCell align="right">الصورة</TableCell>
            <TableCell align="right">العنوان</TableCell>
            <TableCell align="right">المراجعة</TableCell>
            <TableCell align="right">تاريخ الرفع</TableCell>
            <TableCell align="right">الصلاحيات</TableCell>
            <TableCell align="right">الحالة</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading
            ? Array.from({ length: SKELETON_ROWS }, (_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }, (_, j) => (
                    <TableCell key={j} align="right">
                      <Skeleton width={j === 0 ? 40 : 80} height={j === 0 ? 40 : 20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : diagrams.map((diagram) => {
                const thumbnailUrl = diagram.currentVersion?.id
                  ? `/api/diagrams/${diagram.id}/versions/${diagram.currentVersion.id}/thumbnail`
                  : undefined;

                return (
                  <TableRow key={diagram.id} hover>
                    <TableCell align="right">
                      <Avatar
                        variant="rounded"
                        src={thumbnailUrl}
                        sx={{ width: 40, height: 40 }}
                      >
                        📄
                      </Avatar>
                    </TableCell>
                    <TableCell align="right">{diagram.title}</TableCell>
                    <TableCell align="right">
                      {diagram.currentVersion?.revisionLabel ?? '-'}
                    </TableCell>
                    <TableCell align="right">
                      {formatTimeAgo(diagram.updatedAt)}
                    </TableCell>
                    <TableCell align="right">{diagram.versionCount}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={diagram.isActive ? 'نشط' : 'غير نشط'}
                        color={diagram.isActive ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);