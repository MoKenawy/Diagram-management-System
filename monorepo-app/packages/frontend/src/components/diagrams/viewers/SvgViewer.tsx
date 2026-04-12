// src/components/diagrams/viewers/SvgViewer.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, CircularProgress, Button, Typography, IconButton, Tooltip } from '@mui/material';
import { Refresh, ZoomIn, ZoomOut, FitScreen, CenterFocusStrong } from '@mui/icons-material';
import DOMPurify from 'dompurify';
import { privateApi as api } from '@/api/axiosClient';
import { getDownloadUrl } from '@/utils/diagramFormatUtils';

interface SvgViewerProps {
  diagramId: string;
  versionId: string;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const ZOOM_STEP = 0.1;

export const SvgViewer = ({ diagramId, versionId }: SvgViewerProps) => {
  const [svgHtml, setSvgHtml]       = useState<string | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Keep zoom + pan in refs so event handlers always read current values
  // without needing them as deps (avoids stale closures)
  const zoomRef        = useRef(1);
  const panRef         = useRef({ x: 0, y: 0 });
  const isDraggingRef  = useRef(false);
  const dragStartRef   = useRef({ x: 0, y: 0 });
  const panStartRef    = useRef({ x: 0, y: 0 });

  // Separate display state — only updated to trigger re-render
  const [zoom, setZoom] = useState(1);
  const [pan, setPan]   = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const svgWrapRef   = useRef<HTMLDivElement>(null);

  const fileUrl = getDownloadUrl(diagramId, versionId);

  // ─── Unified transform updater ───────────────────────────────
  const applyTransform = useCallback((newZoom: number, newPan: { x: number; y: number }) => {
    zoomRef.current = newZoom;
    panRef.current  = newPan;
    setZoom(newZoom);
    setPan(newPan);
  }, []);

  // ─── Load ────────────────────────────────────────────────────
  const loadSvg = async (): Promise<void> => {
    setIsLoading(true);
    setError(false);
    setSvgHtml(null);
    applyTransform(1, { x: 0, y: 0 });
    try {
      const response = await api.get<string>(fileUrl, { responseType: 'text' });
      const sanitized = DOMPurify.sanitize(response.data, {
        USE_PROFILES: { svg: true },
      });
      setSvgHtml(sanitized);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadSvg(); }, [fileUrl]);

  // ─── Strip hardcoded dimensions ──────────────────────────────
  useEffect(() => {
    if (!svgWrapRef.current || !svgHtml) return;
    const svg = svgWrapRef.current.querySelector('svg');
    if (!svg) return;
    if (!svg.getAttribute('viewBox')) {
      const w = svg.getAttribute('width');
      const h = svg.getAttribute('height');
      if (w && h) svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    }
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.style.width  = '100%';
    svg.style.height = '100%';
  }, [svgHtml]);

  // ─── Wheel zoom ───────────────────────────────────────────────
  // Uses refs — never stale, never causes re-registration
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current || isDraggingRef.current) return;

    const rect   = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Normalize across deltaMode (pixel / line / page)
    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 20;
    if (e.deltaMode === 2) delta *= 300;

    const factor  = Math.pow(0.997, delta);
    const prevZ   = zoomRef.current;
    const nextZ   = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prevZ * factor));
    const scale   = nextZ / prevZ;
    const prevPan = panRef.current;

    // Zoom toward the cursor — compute both atomically using refs
    applyTransform(nextZ, {
      x: mouseX - scale * (mouseX - prevPan.x),
      y: mouseY - scale * (mouseY - prevPan.y),
    });
  }, [applyTransform]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ─── Mouse drag ───────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current  = true;
    dragStartRef.current   = { x: e.clientX, y: e.clientY };
    panStartRef.current    = { ...panRef.current };
    setIsDragging(true);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    applyTransform(zoomRef.current, {
      x: panStartRef.current.x + (e.clientX - dragStartRef.current.x),
      y: panStartRef.current.y + (e.clientY - dragStartRef.current.y),
    });
  }, [applyTransform]);

  const onMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // ─── Touch pan ────────────────────────────────────────────────
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1 || !lastTouchRef.current) return;
    const dx = e.touches[0].clientX - lastTouchRef.current.x;
    const dy = e.touches[0].clientY - lastTouchRef.current.y;
    applyTransform(zoomRef.current, {
      x: panRef.current.x + dx,
      y: panRef.current.y + dy,
    });
    lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, [applyTransform]);

  const onTouchEnd = useCallback(() => { lastTouchRef.current = null; }, []);

  // ─── Controls ─────────────────────────────────────────────────
  const fitToScreen = useCallback(() => applyTransform(1, { x: 0, y: 0 }), [applyTransform]);
  const center      = useCallback(() => applyTransform(zoomRef.current, { x: 0, y: 0 }), [applyTransform]);
  const zoomIn      = useCallback(() => applyTransform(Math.min(MAX_ZOOM, +(zoomRef.current + ZOOM_STEP).toFixed(2)), panRef.current), [applyTransform]);
  const zoomOut     = useCallback(() => applyTransform(Math.max(MIN_ZOOM, +(zoomRef.current - ZOOM_STEP).toFixed(2)), panRef.current), [applyTransform]);
  const resetZoom   = useCallback(() => applyTransform(1, panRef.current), [applyTransform]);

  // ─── Render ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="calc(100vh - 240px)">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !svgHtml) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="calc(100vh - 240px)">
        <Typography color="error" gutterBottom>فشل تحميل ملف SVG</Typography>
        <Button startIcon={<Refresh />} onClick={loadSvg} variant="outlined" sx={{ borderRadius: 2 }}>
          إعادة المحاولة
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 'calc(100vh - 240px)', overflow: 'hidden', bgcolor: '#f8f8f8' }}>

      {/* Canvas */}
      <Box
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        sx={{
          width: '100%',
          height: '100%',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        <div
          ref={svgWrapRef}
          style={{
            width: '100%',
            height: '100%',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      </Box>

      {/* Toolbar */}
      <Box
        className="no-print"
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          bgcolor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          px: 1,
          py: 0.5,
          boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
        }}
      >
        <Tooltip title="تكبير">
          <span>
            <IconButton size="small" onClick={zoomIn} disabled={zoom >= MAX_ZOOM}>
              <ZoomIn fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Typography
          variant="caption"
          sx={{ minWidth: 44, textAlign: 'center', fontWeight: 500, cursor: 'pointer' }}
          onClick={resetZoom}
        >
          {Math.round(zoom * 100)}%
        </Typography>

        <Tooltip title="تصغير">
          <span>
            <IconButton size="small" onClick={zoomOut} disabled={zoom <= MIN_ZOOM}>
              <ZoomOut fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Box sx={{ width: '1px', height: 20, bgcolor: 'divider', mx: 0.5 }} />

        <Tooltip title="ملاءمة الشاشة">
          <IconButton size="small" onClick={fitToScreen}>
            <FitScreen fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="توسيط">
          <IconButton size="small" onClick={center}>
            <CenterFocusStrong fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="إعادة تحميل">
          <IconButton size="small" onClick={loadSvg}>
            <Refresh fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Hint */}
      {zoom === 1 && !isDragging && (
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(0,0,0,0.45)',
            color: '#fff',
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          اسحب للتنقل • عجلة الماوس للتكبير
        </Typography>
      )}
    </Box>
  );
};