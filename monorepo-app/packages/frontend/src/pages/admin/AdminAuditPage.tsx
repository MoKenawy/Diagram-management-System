import { useState } from 'react';
import { 
  Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableHead, TableRow, Chip, Collapse, IconButton,
  TableContainer, Paper
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useAuditLogs } from '@/hooks/queries/useAdminQueries';

const ACTIONS = ['LOGIN', 'LOGOUT', 'DIAGRAM_CREATED', 'VERSION_UPLOADED', 'DIAGRAM_DOWNLOADED', 'USER_CREATED'];

const AuditRow = ({ log }: { log: any }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{new Date(log.occurredAt).toLocaleString('ar-EG')}</TableCell>
        <TableCell>{log.user?.username || 'النظام'}</TableCell>
        <TableCell><Chip size="small" label={log.action} color="primary" variant="outlined" /></TableCell>
        <TableCell>{log.targetType || '-'}</TableCell>
        <TableCell>{log.ipAddress || '-'}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>البيانات الوصفية (Metadata):</Typography>
              <pre style={{ margin: 0, fontSize: '0.8rem' }}>
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const AdminAuditPage = () => {
  const [filters, setFilters] = useState({ action: '', from: '', to: '' });
  
  // Uses your exact hook pattern
  const { data, isLoading } = useAuditLogs({ limit: 50, ...filters });

  return (
    <Box>
      <Typography variant="h5" mb={3}>سجل النظام</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>الإجراء</InputLabel>
          <Select value={filters.action} label="الإجراء" onChange={e => setFilters(f => ({...f, action: e.target.value}))}>
            <MenuItem value="">الكل</MenuItem>
            {ACTIONS.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField type="date" size="small" label="من تاريخ" InputLabelProps={{ shrink: true }} value={filters.from} onChange={e => setFilters(f => ({...f, from: e.target.value}))} />
        <TextField type="date" size="small" label="إلى تاريخ" InputLabelProps={{ shrink: true }} value={filters.to} onChange={e => setFilters(f => ({...f, to: e.target.value}))} />
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell width={40} />
              <TableCell>التاريخ والوقت</TableCell>
              <TableCell>المستخدم</TableCell>
              <TableCell>الإجراء</TableCell>
              <TableCell>الهدف</TableCell>
              <TableCell>IP</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} align="center">جاري التحميل...</TableCell></TableRow>
            ) : (
              data?.data.map((log: any) => <AuditRow key={log.id} log={log} />)
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};