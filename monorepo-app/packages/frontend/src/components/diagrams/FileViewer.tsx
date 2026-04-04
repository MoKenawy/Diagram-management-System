// src/components/diagrams/FileViewer.tsx
import type { FileFormat } from '@/types/index';
import { PdfViewer } from './viewers/PdfViewer';
import { ImageViewer } from './viewers/ImageViewer';
import { SvgViewer } from './viewers/SvgViewer';
import { DwgPlaceholder } from './viewers/DwgPlaceholder';
import { useDiagramDownload } from '@/hooks/useDiagramDownload';

interface FileViewerProps {
  diagramId: string;
  versionId: string;
  fileFormat: FileFormat;
}

export const FileViewer = ({ diagramId, versionId, fileFormat }: FileViewerProps) => {
  const { download } = useDiagramDownload();

  const handleDownload = (): void => {
    download(diagramId, versionId);
  };

  switch (fileFormat) {
    case 'PDF':
      return <PdfViewer diagramId={diagramId} versionId={versionId} />;

    case 'JPEG':
    case 'PNG':
      return <ImageViewer diagramId={diagramId} versionId={versionId} />;

    case 'SVG':
      return <SvgViewer diagramId={diagramId} versionId={versionId} />;

    case 'DWG':
      return <DwgPlaceholder onDownload={handleDownload} />;

    default:
      return <DwgPlaceholder onDownload={handleDownload} />;
  }
};