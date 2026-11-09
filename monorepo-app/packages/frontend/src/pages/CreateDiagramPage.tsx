// src/pages/CreateDiagramPage.tsx
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from '@tanstack/react-router';

import { useActiveDepartments } from '@/hooks/queries/useDepartmentQueries';
import { CreateDiagramForm } from '@/components/diagrams/CreateDiagramForm';

export default function CreateDiagramPage() {
  const navigate = useNavigate();
  const departmentsQuery = useActiveDepartments();
  const departments = departmentsQuery.data ?? [];

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="flex-start" spacing={1}>
          <Button
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate({ to: '/archive' })}
            sx={{ mt: 0.5 }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h4" component="h1">
              Upload New Diagram
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create a new diagram and upload its first version.
            </Typography>
          </Box>
        </Stack>

        {departmentsQuery.isLoading && (
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Loading departments…
            </Typography>
          </Stack>
        )}

        {departmentsQuery.isError && (
          <Typography variant="body2" color="error">
            Could not load departments. Please reload the page.
          </Typography>
        )}

        <CreateDiagramForm
          departments={departments}
          departmentsLoading={departmentsQuery.isLoading}
          onCancel={() => navigate({ to: '/archive' })}
        />
      </Stack>
    </Container>
  );
}
