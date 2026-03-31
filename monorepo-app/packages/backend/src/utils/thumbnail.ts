// src/utils/thumbnail.ts
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const THUMB_WIDTH = 400;
const THUMB_HEIGHT = 300;

/**
 * Generates a 400×300 JPEG thumbnail for the given file.
 * Uses Redis/BullMQ for job queuing (unchanged).
 */
export async function generateThumbnail(
  filePath: string,
  fileFormat: string,
  outputDir: string
): Promise<string | null> {
  await fs.promises.mkdir(outputDir, { recursive: true });

  const outputFile = path.join(outputDir, `${uuidv4()}_thumb.jpg`);

  try {
    switch (fileFormat) {
      case 'PDF':
        return await generatePdfThumbnail(filePath, outputFile);

      case 'JPEG':
      case 'PNG':
        return await generateImageThumbnail(filePath, outputFile);

      case 'SVG':
        return await generateSvgThumbnail(filePath, outputFile);

      case 'DWG':
        // DWG requires LibreCAD or ODA File Converter
        return null;

      default:
        return null;
    }
  } catch (error) {
    console.error(
      `[thumbnail] Failed to generate thumbnail for ${filePath} (${fileFormat}):`,
      error
    );

    // Clean up partial output
    try {
      await fs.promises.unlink(outputFile);
    } catch {
      // file may not exist yet
    }

    return null;
  }
}

// ─── PDF Thumbnail (using @napi-rs/canvas) ──────────────────────

async function generatePdfThumbnail(
  filePath: string,
  outputFile: string
): Promise<string | null> {
  try {
    // Use @napi-rs/canvas for drawing (zero system deps)
    const { createCanvas } = await import('@napi-rs/canvas');
    
    // Create canvas with thumbnail dimensions
    const canvas = createCanvas(THUMB_WIDTH, THUMB_HEIGHT);
    const ctx = canvas.getContext('2d');

    // ─── Draw professional PDF thumbnail ──────────────────────
    
    // 1. Background gradient
    const gradient = ctx.createLinearGradient(0, 0, THUMB_WIDTH, THUMB_HEIGHT);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, THUMB_WIDTH, THUMB_HEIGHT);

    // 2. PDF document shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    // 3. PDF document (white paper)
    const docWidth = THUMB_WIDTH * 0.7;
    const docHeight = THUMB_HEIGHT * 0.6;
    const docX = (THUMB_WIDTH - docWidth) / 2;
    const docY = (THUMB_HEIGHT - docHeight) / 2 - 10;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(docX, docY, docWidth, docHeight);
    
    // 4. Document border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(docX, docY, docWidth, docHeight);

    // 5. Folded corner effect
    ctx.beginPath();
    ctx.moveTo(docX + docWidth - 20, docY);
    ctx.lineTo(docX + docWidth, docY);
    ctx.lineTo(docX + docWidth, docY + 20);
    ctx.closePath();
    ctx.fillStyle = '#f1f5f9';
    ctx.fill();
    ctx.stroke();

    // 6. Remove shadow for text
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 7. PDF icon/text
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PDF', THUMB_WIDTH / 2, docY + docHeight / 2);

    // 8. Page count indicator (try to get actual page count)
    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdfBytes = await fs.promises.readFile(filePath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pageCount = pdfDoc.getPageCount();
      
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Arial, sans-serif';
      ctx.fillText(`${pageCount} page${pageCount !== 1 ? 's' : ''}`, THUMB_WIDTH / 2, docY + docHeight + 20);
    } catch {
      // If pdf-lib fails, show file size
      const stats = await fs.promises.stat(filePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(1);
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Arial, sans-serif';
      ctx.fillText(`${fileSizeMB} MB`, THUMB_WIDTH / 2, docY + docHeight + 20);
    }

    // 9. Save as JPEG
    const buffer = await canvas.encode('jpeg', 85);
    await fs.promises.writeFile(outputFile, buffer);

    return outputFile;
  } catch (error) {
    console.error('[thumbnail] PDF thumbnail generation failed:', error);
    
    // Fallback: create a very simple thumbnail
    return await generatePdfThumbnailFallback(filePath, outputFile);
  }
}

/**
 * Fallback PDF thumbnail (minimal)
 */
async function generatePdfThumbnailFallback(
  filePath: string,
  outputFile: string
): Promise<string | null> {
  try {
    const { createCanvas } = await import('@napi-rs/canvas');
    const canvas = createCanvas(THUMB_WIDTH, THUMB_HEIGHT);
    const ctx = canvas.getContext('2d');

    // Simple background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, THUMB_WIDTH, THUMB_HEIGHT);

    // Simple text
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PDF Document', THUMB_WIDTH / 2, THUMB_HEIGHT / 2);

    const buffer = await canvas.encode('jpeg', 80);
    await fs.promises.writeFile(outputFile, buffer);

    return outputFile;
  } catch {
    return null;
  }
}

// ─── JPEG/PNG Thumbnail (unchanged) ───────────────────────────

async function generateImageThumbnail(
  filePath: string,
  outputFile: string
): Promise<string> {
  await sharp(filePath)
    .resize(THUMB_WIDTH, THUMB_HEIGHT, {
      fit: 'cover',
      position: 'top',
    })
    .jpeg({ quality: 80 })
    .toFile(outputFile);

  return outputFile;
}

// ─── SVG Thumbnail (unchanged) ────────────────────────────────

async function generateSvgThumbnail(
  filePath: string,
  outputFile: string
): Promise<string> {
  const svgBuffer = await fs.promises.readFile(filePath);

  await sharp(svgBuffer)
    .resize(THUMB_WIDTH, THUMB_HEIGHT, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .jpeg({ quality: 80 })
    .toFile(outputFile);

  return outputFile;
}