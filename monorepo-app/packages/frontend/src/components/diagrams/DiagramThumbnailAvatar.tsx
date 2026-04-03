// src/components/diagrams/DiagramThumbnailAvatar.tsx
import { Avatar } from '@mui/material';
import { useThumbnailUrl } from '@/hooks/useThumbnailUrl';

interface DiagramThumbnailAvatarProps {
  diagramId: string;
  versionId: string | null | undefined;
}

export const DiagramThumbnailAvatar = ({
  diagramId,
  versionId,
}: DiagramThumbnailAvatarProps) => {
  const thumbnailUrl = useThumbnailUrl(diagramId, versionId);

  return (
    <Avatar
      variant="rounded"
      src={thumbnailUrl ?? undefined}
      sx={{ width: 40, height: 40 }}
    >
      📄
    </Avatar>
  );
};