import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { prisma } from '../lib/prisma';

const FILE_STORAGE_PATH = process.env.FILE_STORAGE_PATH || './uploads';

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.svg', '.dwg'];

// Cache for SystemConfig max upload size
let cachedMaxUploadSizeMB: number | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 60_000; // 60 seconds

export async function getMaxUploadSizeMB(): Promise<number> {
  const now = Date.now();
  if (cachedMaxUploadSizeMB !== null && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedMaxUploadSizeMB;
  }

  try {
    const config = await prisma.systemConfig.findFirst({
      where: { key: 'MAX_UPLOAD_SIZE_MB' },
    });
    if (config && config.value) {
      const parsed = parseInt(config.value, 10);
      if (!isNaN(parsed) && parsed > 0) {
        cachedMaxUploadSizeMB = parsed;
        cacheTimestamp = now;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read SystemConfig for MAX_UPLOAD_SIZE_MB:', err);
  }

  // Fallback to env variable
  const envVal = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '50', 10);
  cachedMaxUploadSizeMB = isNaN(envVal) || envVal <= 0 ? 50 : envVal;
  cacheTimestamp = now;
  return cachedMaxUploadSizeMB;
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const dest = path.join(FILE_STORAGE_PATH, year, month);

    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`));
  }
};

export function createUploadMiddleware() {
  return multer({
    storage,
    fileFilter,
    limits: {
      // We'll set a generous hard limit here; actual validation happens in route
      fileSize: 200 * 1024 * 1024, // 200MB hard ceiling
    },
  });
}

/**
 * Middleware to validate file size against dynamic SystemConfig limit.
 * Should be used AFTER multer processes the file.
 */
export async function validateFileSize(
  req: Request,
  _res: any,
  next: any
): Promise<void> {
  if (!req.file) {
    return next();
  }

  try {
    const maxMB = await getMaxUploadSizeMB();
    const maxBytes = maxMB * 1024 * 1024;

    if (req.file.size > maxBytes) {
      // Cleanup uploaded file
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupErr) {
        console.error('Failed to cleanup oversized file:', cleanupErr);
      }

      const error: any = new Error(
        `File size ${(req.file.size / (1024 * 1024)).toFixed(2)}MB exceeds maximum allowed size of ${maxMB}MB`
      );
      error.status = 400;
      return next(error);
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Map file extension to FileFormat enum value.
 */
export function extToFileFormat(ext: string): string {
  const map: Record<string, string> = {
    '.pdf': 'PDF',
    '.jpg': 'JPEG',
    '.jpeg': 'JPEG',
    '.png': 'PNG',
    '.svg': 'SVG',
    '.dwg': 'DWG',
  };
  return map[ext.toLowerCase()] || 'PDF';
}

export const upload = createUploadMiddleware();