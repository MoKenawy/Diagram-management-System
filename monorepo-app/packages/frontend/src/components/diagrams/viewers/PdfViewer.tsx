// src/components/diagrams/viewers/PdfViewer.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  IconButton,
  Typography,
  TextField,
  CircularProgress,
  Button,
  Stack,
} from '@mui/material';
import {
  NavigateBefore,
  NavigateNext,
  ZoomIn,
  ZoomOut,
  FitScreen,
  Refresh,
} from '@mui/icons-material';
import * as pdfjsLib from 'pdfjs-dist';
import { api } from '@/services/api/authService';
import { PDF_VIEWER_ZOOM_STEP, PDF_VIEWER_MIN_ZOOM, PDF_VIEWER_MAX_ZOOM} from '@/config/api';
import { getDownloadUrl } from '@/utils/diagramFormatUtils';


pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();


interface PdfViewerProps {
  diagramId: string;
  versionId: string;
}

type PdfDocProxy = pdfjsLib.PDFDocumentProxy;
type PdfPageProxy = pdfjsLib.PDFPageProxy;

const ZOOM_STEP = PDF_VIEWER_ZOOM_STEP;
const MIN_ZOOM = PDF_VIEWER_MIN_ZOOM;
const MAX_ZOOM = PDF_VIEWER_MAX_ZOOM;

export const PdfViewer = ({ diagramId, versionId }: PdfViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PdfDocProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pageInput, setPageInput] = useState('1');

  const fileUrl = getDownloadUrl(diagramId, versionId);
  
  const loadPdf = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(false);
    try {
      const response = await api.get(fileUrl, { responseType: 'arraybuffer' });
      const data = new Uint8Array(response.data as ArrayBuffer);
      const doc: PdfDocProxy = await pdfjsLib.getDocument({ data }).promise;
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setCurrentPage(1);
      setPageInput('1');
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [fileUrl]);

  useEffect(() => {
    loadPdf();
  }, [loadPdf]);

  const renderPage = useCallback(
    async (pageNum: number): Promise<void> => {
      if (!pdfDoc || !canvasRef.current) return;

      const page: PdfPageProxy = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas: HTMLCanvasElement = canvasRef.current;
      const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
    },
    [pdfDoc, scale]
  );

  useEffect(() => {
    renderPage(currentPage);
  }, [renderPage, currentPage]);

  const goToPage = useCallback(
    (page: number): void => {
      const clamped: number = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(clamped);
      setPageInput(String(clamped));
    },
    [totalPages]
  );

  const handlePageInputSubmit = useCallback((): void => {
    const parsed: number = parseInt(pageInput, 10);
    if (!isNaN(parsed)) goToPage(parsed);
  }, [pageInput, goToPage]);

  const fitWidth = useCallback((): void => {
    if (!pdfDoc || !containerRef.current) return;
    pdfDoc.getPage(currentPage).then((page: PdfPageProxy) => {
      const viewport = page.getViewport({ scale: 1 });
      const containerWidth: number = containerRef.current!.clientWidth - 32;
      const newScale: number = containerWidth / viewport.width;
      setScale(Math.max(MIN_ZOOM, Math.min(newScale, MAX_ZOOM)));
    });
  }, [pdfDoc, currentPage]);

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
        <Typography color="error" gutterBottom>فشل تحميل ملف PDF</Typography>
        <Button startIcon={<Refresh />} onClick={loadPdf} variant="outlined" sx={{ borderRadius: 2 }}>
          إعادة المحاولة
        </Button>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box ref={containerRef}>
      {/* Controls */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="center"
        sx={{ mb: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: 2 }}
        className="no-print"
      >
        <IconButton size="small" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
          <NavigateNext fontSize="small" />
        </IconButton>

        <TextField
          size="small"
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value)}
          onBlur={handlePageInputSubmit}
          onKeyDown={(e) => { if (e.key === 'Enter') handlePageInputSubmit(); }}
          sx={{ width: 60, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          slotProps={{ htmlInput: { style: { textAlign: 'center' } } }}
        />
        <Typography variant="body2" color="text.secondary">
          من {totalPages}
        </Typography>

        <IconButton size="small" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>
          <NavigateBefore fontSize="small" />
        </IconButton>

        <Box sx={{ mx: 1, borderLeft: '1px solid #ddd', height: 24 }} />

        <IconButton size="small" onClick={() => setScale((s) => Math.min(s + ZOOM_STEP, MAX_ZOOM))}>
          <ZoomIn fontSize="small" />
        </IconButton>
        <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center' }}>
          {Math.round(scale * 100)}%
        </Typography>
        <IconButton size="small" onClick={() => setScale((s) => Math.max(s - ZOOM_STEP, MIN_ZOOM))}>
          <ZoomOut fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={fitWidth}>
          <FitScreen fontSize="small" />
        </IconButton>
      </Stack>

      {/* Canvas */}
      <Box
        sx={{
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          maxHeight: 'calc(100vh - 240px)',
        }}
      >
        <canvas ref={canvasRef} style={{ display: 'block' }} />
      </Box>
    </Box>
  );
};