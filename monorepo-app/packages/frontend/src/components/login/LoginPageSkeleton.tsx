// src/components/login/LoginPageSkeleton.tsx
import { Box, Card, CardContent, Container, Skeleton, Stack } from '@mui/material';

export const LoginPageSkeleton = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f9f9ff 0%, #c8e6c9 100%)',
    }}
  >
    <Container maxWidth="sm">
      <Card elevation={0} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{ height: 6, background: '#e0e0e0' }} />
        <CardContent sx={{ p: 5 }}>
          <Stack spacing={2.5} alignItems="center">
            <Skeleton variant="text" width={220} height={40} />
            <Skeleton variant="text" width={280} height={20} />
            <Skeleton variant="rounded" width="100%" height={56} sx={{ borderRadius: 3 }} />
            <Skeleton variant="rounded" width="100%" height={56} sx={{ borderRadius: 3 }} />
            <Skeleton variant="rounded" width="100%" height={48} sx={{ borderRadius: 3 }} />
          </Stack>
        </CardContent>
      </Card>
    </Container>
  </Box>
);