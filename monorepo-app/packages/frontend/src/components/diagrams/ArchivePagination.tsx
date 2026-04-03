// src/components/diagrams/ArchivePagination.tsx
import {
  Box,
  Typography,
  Pagination as MuiPagination,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import type { PaginationMeta } from '@/types/index';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

interface ArchivePaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export const ArchivePagination = ({
  pagination,
  onPageChange,
  onLimitChange,
}: ArchivePaginationProps) => {
  const { page, limit, total, totalPages } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
      gap={2}
      mt={3}
    >
      <Typography variant="body2" color="text.secondary">
        يتم عرض {from}–{to} من {total} لوحة
      </Typography>

      <Box display="flex" alignItems="center" gap={2}>
        <FormControl size="small">
          <Select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            sx={{ borderRadius: 2, minWidth: 80 }}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <MuiPagination
          count={totalPages}
          page={page}
          onChange={(_, newPage) => onPageChange(newPage)}
          shape="rounded"
          color="primary"
          size="small"
        />
      </Box>
    </Box>
  );
};