// src/components/diagrams/DiagramTableView.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
} from '@mui/material';
import { DiagramTableRow } from './DiagramTableRow';
import type { DiagramSummaryResponse, Role } from '@/types/index';

const PRIVILEGED_ROLES: Role[] = ['DC' as Role, 'ADMIN' as Role];

interface DiagramTableViewProps {
  diagrams: DiagramSummaryResponse[];
  userRole: Role;
  isLoading: boolean;
  onRowClick: (id: string) => void;
  onDownload: (diagramId: string, versionId: string) => void;
  onEditMetadata?: (id: string) => void;
  onManageAccess?: (id: string) => void;
  onUploadRevision?: (id: string) => void;
  onDeactivate?: (id: string) => void;
}

const SKELETON_ROWS = 8;
const COLUMN_COUNT = 8;

const TableSkeleton = () => (
  <>
    {Array.from({ length: SKELETON_ROWS }, (_, i) => (
      <TableRow key={i}>
        {Array.from({ length: COLUMN_COUNT }, (_, j) => (
          <TableCell key={j} align="right">
            <Skeleton width={j === 0 ? 40 : 80} height={j === 0 ? 40 : 20} />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

export const DiagramTableView = ({
  diagrams,
  userRole,
  isLoading,
  onRowClick,
  onDownload,
  onEditMetadata,
  onManageAccess,
  onUploadRevision,
  onDeactivate,
}: DiagramTableViewProps) => {
  const canManage = PRIVILEGED_ROLES.includes(userRole);

  return (
    <TableContainer
      component={Paper}
      sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e0e0e0' }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#fafafa' }}>
            <TableCell align="right">الصورة</TableCell>
            <TableCell align="right">العنوان</TableCell>
            <TableCell align="right">المراجعة</TableCell>
            <TableCell align="right">النوع</TableCell>
            <TableCell align="right">القسم</TableCell>
            <TableCell align="right">الرافع</TableCell>
            <TableCell align="right">التاريخ</TableCell>
            <TableCell align="right">إجراءات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            diagrams.map((diagram) => (
              <DiagramTableRow
                key={diagram.id}
                diagram={diagram}
                canManage={canManage}
                onRowClick={onRowClick}
                onDownload={onDownload}
                onEditMetadata={onEditMetadata}
                onManageAccess={onManageAccess}
                onUploadRevision={onUploadRevision}
                onDeactivate={onDeactivate}
              />
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};