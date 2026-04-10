import { Box, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Card, CardContent, CardActions } from '@mui/material';
import Grid from '@mui/material/Grid';

// -- 1. Users Skeleton --
export const AdminUsersPageSkeleton = () => (
  <Box>
    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
      <Skeleton variant="rounded" width={200} height={40} />
      <Skeleton variant="rounded" width={120} height={40} />
      <Skeleton variant="rounded" width={150} height={40} />
      <Skeleton variant="rounded" width={120} height={40} />
      <Box sx={{ flexGrow: 1 }} />
      <Skeleton variant="rounded" width={150} height={40} />
    </Box>
    <Table size="small">
      <TableHead>
        <TableRow>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableCell key={i}><Skeleton width={80} /></TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton width={100} /></TableCell>
            <TableCell><Skeleton width={150} /></TableCell>
            <TableCell><Skeleton variant="rounded" width={60} height={24} /></TableCell>
            <TableCell><Skeleton width={120} /></TableCell>
            <TableCell><Skeleton variant="rounded" width={60} height={24} /></TableCell>
            <TableCell align="center"><Skeleton variant="circular" width={30} height={30} sx={{ mx: 'auto' }} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
);

// -- 2. Config Skeleton --
export const AdminConfigPageSkeleton = () => (
  <Box sx={{ maxWidth: 800 }}>
    <Skeleton width={200} height={40} sx={{ mb: 4 }} />
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rounded" height={56} /></Grid>
      <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rounded" height={56} /></Grid>
      <Grid size={{ xs: 12 }}><Skeleton variant="rounded" height={64} /></Grid>
    </Grid>
    <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
      <Skeleton variant="rounded" width={120} height={40} />
      <Skeleton variant="rounded" width={120} height={40} />
    </Box>
  </Box>
);

// -- 3. Backups Skeleton --
export const AdminBackupsPageSkeleton = () => (
  <Box>
    <Box display="flex" justifyContent="space-between" mb={3}>
      <Skeleton width={200} height={40} />
      <Skeleton variant="rounded" width={160} height={40} />
    </Box>
    <Table size="small">
      <TableHead>
        <TableRow>
          {Array.from({ length: 5 }).map((_, i) => <TableCell key={i}><Skeleton width={80} /></TableCell>)}
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: 4 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton width={120} /></TableCell>
            <TableCell><Skeleton width={80} /></TableCell>
            <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
            <TableCell><Skeleton width={100} /></TableCell>
            <TableCell align="center"><Skeleton variant="rounded" width={80} height={30} sx={{ mx: 'auto' }} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
);

// -- 4. Replication Skeleton --
export const AdminReplicationPageSkeleton = () => (
  <Box>
    <Box display="flex" justifyContent="space-between" mb={4}>
      <Skeleton width={250} height={40} />
      <Skeleton variant="rounded" width={120} height={40} />
    </Box>
    <Grid container spacing={3}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Skeleton width={120} height={30} />
                <Skeleton variant="rounded" width={80} height={24} />
              </Box>
              <Skeleton width="80%" sx={{ mb: 1 }} />
              <Skeleton width="60%" sx={{ mb: 2 }} />
              <Skeleton width="50%" />
            </CardContent>
            <CardActions sx={{ bgcolor: 'action.hover', justifyContent: 'space-between' }}>
              <Skeleton variant="rounded" width={100} height={30} />
              <Box display="flex" gap={1}>
                <Skeleton variant="circular" width={30} height={30} />
                <Skeleton variant="circular" width={30} height={30} />
              </Box>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);

// -- 5. Audit Skeleton --
export const AdminAuditPageSkeleton = () => (
  <Box>
    <Skeleton width={150} height={40} sx={{ mb: 3 }} />
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <Skeleton variant="rounded" width={200} height={40} />
      <Skeleton variant="rounded" width={150} height={40} />
      <Skeleton variant="rounded" width={150} height={40} />
    </Box>
    <Table size="small">
      <TableHead>
        <TableRow>
          {Array.from({ length: 6 }).map((_, i) => <TableCell key={i}><Skeleton width={60} /></TableCell>)}
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: 10 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton variant="circular" width={24} height={24} /></TableCell>
            <TableCell><Skeleton width={120} /></TableCell>
            <TableCell><Skeleton width={100} /></TableCell>
            <TableCell><Skeleton variant="rounded" width={120} height={24} /></TableCell>
            <TableCell><Skeleton width={100} /></TableCell>
            <TableCell><Skeleton width={80} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
);