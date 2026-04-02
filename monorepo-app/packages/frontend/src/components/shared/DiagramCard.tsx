// src/components/shared/DiagramCard.tsx
import { Card, CardContent, CardMedia, Typography, Box, Chip, Skeleton } from '@mui/material';
import type { DiagramSummaryResponse } from '@/types/index';
import { formatTimeAgo } from '@/utils/formatters';

interface DiagramCardProps {
  diagram: DiagramSummaryResponse;
  onClick?: (id: string) => void;
}

export const DiagramCard = ({ diagram, onClick }: DiagramCardProps) => {
  const thumbnailUrl = diagram.currentVersion?.id
    ? `/api/diagrams/${diagram.id}/versions/${diagram.currentVersion.id}/thumbnail`
    : null;

  return (
    <Card
      sx={{
        borderRadius: 3,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s',
        '&:hover': onClick ? { boxShadow: '0 6px 20px rgba(0,0,0,0.12)' } : {},
      }}
      onClick={() => onClick?.(diagram.id)}
    >
      {thumbnailUrl ? (
        <CardMedia
          component="img"
          height={160}
          image={thumbnailUrl}
          alt={diagram.title}
          sx={{ objectFit: 'cover' }}
        />
      ) : (
        <Box
          height={160}
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ backgroundColor: '#f5f5f5' }}
        >
          <Typography color="text.disabled">لا توجد صورة مصغرة</Typography>
        </Box>
      )}
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap>
          {diagram.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {diagram.department.nameAr} · {formatTimeAgo(diagram.createdAt)}
        </Typography>
        <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
          {diagram.tags.slice(0, 3).map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ borderRadius: 1.5 }} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export const DiagramCardSkeleton = () => (
  <Card sx={{ borderRadius: 3 }}>
    <Skeleton variant="rectangular" height={160} />
    <CardContent sx={{ p: 2 }}>
      <Skeleton width="70%" height={24} />
      <Skeleton width="50%" height={16} sx={{ mt: 0.5 }} />
      <Box display="flex" gap={0.5} mt={1}>
        <Skeleton width={50} height={24} sx={{ borderRadius: 1.5 }} />
        <Skeleton width={60} height={24} sx={{ borderRadius: 1.5 }} />
      </Box>
    </CardContent>
  </Card>
);