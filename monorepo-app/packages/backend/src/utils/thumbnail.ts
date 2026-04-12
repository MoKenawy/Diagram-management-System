// src/utils/thumbnail.ts
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'child_process';

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


export async function generatePdfThumbnail(
  filePath: string,
  outputFile: string
): Promise<string> {
  const outputBase = outputFile.replace(/\.(jpg|jpeg|png)$/, '');

  return new Promise((resolve, reject) => {
    const args = [
      '-jpeg',
      '-jpegopt', 'quality=90',
      '-r', '150',
      '-f', '1',
      '-singlefile',
      '-scale-to', '512',
      filePath,
      outputBase,
    ];

    const proc = spawn('pdftoppm', args);

    let stderr = '';

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const timeout = setTimeout(() => {
      proc.kill();
      reject(new Error('Thumbnail generation timeout'));
    }, 10000);

    proc.on('close', async (code) => {
      clearTimeout(timeout);

      if (code !== 0) {
        return reject(new Error(`pdftoppm failed: ${stderr}`));
      }

      const generated = `${outputBase}.jpg`;

      try {
        await fs.promises.access(generated);
        resolve(generated);
      } catch {
        reject(new Error('Thumbnail not generated'));
          // Fallback: create a very simple thumbnail
          return await generatePdfThumbnailFallback(filePath, outputFile);
      }
    });
  });
}


// ─── PDF Thumbnail (using @napi-rs/canvas) ──────────────────────


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