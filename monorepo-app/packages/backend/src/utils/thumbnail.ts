import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_HEIGHT = 300;

/**
 * Generate a thumbnail for the given file.
 * Returns the path to the generated thumbnail, or null if not supported.
 */
export async function generateThumbnail(
  filePath: string,
  fileFormat: string,
  outputDir: string
): Promise<string | null> {
  try {
    fs.mkdirSync(outputDir, { recursive: true });

    const baseName = path.basename(filePath, path.extname(filePath));
    const thumbnailFilename = `${baseName}_thumb.jpg`;
    const thumbnailPath = path.join(outputDir, thumbnailFilename);

    switch (fileFormat.toUpperCase()) {
      case 'PDF':
        return await generatePdfThumbnail(filePath, thumbnailPath);

      case 'JPEG':
      case 'JPG':
      case 'PNG':
        return await generateImageThumbnail(filePath, thumbnailPath);

      case 'SVG':
        return await generateSvgThumbnail(filePath, thumbnailPath);

      case 'DWG':
        // DWG is handled by optional LibreCAD worker
        return null;

      default:
        console.warn(`Unsupported file format for thumbnail generation: ${fileFormat}`);
        return null;
    }
  } catch (error) {
    console.error(`Error generating thumbnail for ${filePath}:`, error);
    return null;
  }
}

async function generatePdfThumbnail(
  filePath: string,
  outputPath: string
): Promise<string | null> {
  try {
    // Dynamic import for pdf2pic
    const { fromPath } = await import('pdf2pic');

    const converter = fromPath(filePath, {
      density: 150,
      saveFilename: 'pdf_page',
      savePath: path.dirname(outputPath),
      format: 'png',
      width: 800,
      height: 600,
    });

    const result = await converter(1, { responseType: 'image' });

    if (result && result.path) {
      // Resize with sharp to final thumbnail dimensions
      await sharp(result.path)
        .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toFile(outputPath);

      // Clean up intermediate PNG
      try {
        if (result.path !== outputPath) {
          fs.unlinkSync(result.path);
        }
      } catch {
        // Ignore cleanup errors
      }

      return outputPath;
    }

    return null;
  } catch (error) {
    console.error('PDF thumbnail generation failed:', error);
    return null;
  }
}

async function generateImageThumbnail(
  filePath: string,
  outputPath: string
): Promise<string | null> {
  await sharp(filePath)
    .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80 })
    .toFile(outputPath);

  return outputPath;
}

async function generateSvgThumbnail(
  filePath: string,
  outputPath: string
): Promise<string | null> {
  const svgBuffer = fs.readFileSync(filePath);

  await sharp(svgBuffer)
    .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80 })
    .toFile(outputPath);

  return outputPath;
}