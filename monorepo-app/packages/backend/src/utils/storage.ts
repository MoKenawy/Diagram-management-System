// src/utils/storage.ts
import multer, { FileFilterCallback, StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { prisma } from '../lib/prisma';

const FILE_STORAGE_PATH = process.env.FILE_STORAGE_PATH || path.resolve(process.cwd(), 'uploads');
const DEFAULT_MAX_UPLOAD_SIZE_MB = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '50', 10);

// ─── Allowed extensions & MIME types ─────────────────────────────
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.svg', '.dwg']);
const EXTENSION_TO_MIME: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.svg': ['image/svg+xml'],
  '.dwg': [
    'application/acad',
    'application/x-acad',
    'application/autocad_dwg',
    'image/vnd.dwg',
    'application/dwg',
    'application/x-dwg',
    'image/x-dwg',
    // Some OS report generic binary for .dwg
    'application/octet-stream',
  ],
};

// ─── SystemConfig cache for max upload size ──────────────────────
let cachedMaxSizeMB: number | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 60_000; // 60 seconds

async function getMaxUploadSizeMB(): Promise<number> {
  const now = Date.now();
  if (cachedMaxSizeMB !== null && now - cachedAt < CACHE_TTL_MS) {
    return cachedMaxSizeMB;
  }

  try {
    const row = await prisma.systemConfig.findUnique({
      where: { key: 'MAX_UPLOAD_SIZE_MB' },
    });
    if (row && row.value) {
      const parsed = parseInt(row.value, 10);
      if (!isNaN(parsed) && parsed > 0) {
        cachedMaxSizeMB = parsed;
        cachedAt = now;
        return parsed;
      }
    }
  } catch {
    // DB not available – fall through to env default
  }

  cachedMaxSizeMB = DEFAULT_MAX_UPLOAD_SIZE_MB;
  cachedAt = now;
  return DEFAULT_MAX_UPLOAD_SIZE_MB;
}

/**
 * Invalidate the cached max-upload-size (call after config update).
 */
export function invalidateUploadSizeCache(): void {
  cachedMaxSizeMB = null;
  cachedAt = 0;
}

// ─── Disk storage engine ─────────────────────────────────────────
const storage: StorageEngine = multer.diskStorage({
  destination(_req: Request, _file: Express.Multer.File, cb) {
    const now = new Date();
    const yyyy = now.getFullYear().toString();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dir = path.join(FILE_STORAGE_PATH, yyyy, mm);

    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },

  filename(_req: Request, file: Express.Multer.File, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

// ─── File filter ─────────────────────────────────────────────────
function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    cb(
      new multer.MulterError(
        'LIMIT_UNEXPECTED_FILE',
        `File type "${ext}" is not allowed. Accepted: ${[...ALLOWED_EXTENSIONS].join(', ')}`
      ) as any
    );
    return;
  }

  // Optionally verify MIME (best-effort; some formats have unreliable MIME)
  const acceptedMimes = EXTENSION_TO_MIME[ext];
  if (acceptedMimes && !acceptedMimes.includes(file.mimetype)) {
    // Allow anyway for .dwg since OS-level MIME detection is unreliable
    if (ext !== '.dwg') {
      cb(
        new multer.MulterError(
          'LIMIT_UNEXPECTED_FILE',
          `MIME type "${file.mimetype}" does not match extension "${ext}"`
        ) as any
      );
      return;
    }
  }

  cb(null, true);
}

// ─── Build the multer instance ───────────────────────────────────
/**
 * Creates a multer upload instance.
 * Call getMaxUploadSizeMB() lazily so the limit can change at runtime.
 */
export function createUpload() {
  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: DEFAULT_MAX_UPLOAD_SIZE_MB * 1024 * 1024,
    },
  });
}

/**
 * Dynamic-size-limit middleware wrapper.
 * Fetches the current max upload size from SystemConfig before delegating to multer.
 */
export function uploadSingle(fieldName: string) {
  return async (req: Request, res: any, next: any) => {
    const maxMB = await getMaxUploadSizeMB();
    const upload = multer({
      storage,
      fileFilter,
      limits: { fileSize: maxMB * 1024 * 1024 },
    }).single(fieldName);

    upload(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // Clean up the partially written file if any
          if (req.file?.path) {
            fs.unlink(req.file.path, () => {});
          }

          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              error: 'FILE_TOO_LARGE',
              message: `File exceeds maximum allowed size of ${maxMB} MB`,
            });
          }

          return res.status(400).json({
            error: 'UPLOAD_ERROR',
            message: err.message || err.field || 'Upload validation failed',
          });
        }

        return next(err);
      }

      next();
    });
  };
}

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Maps a file extension to a Prisma FileFormat enum value.
 */
export function extensionToFileFormat(ext: string): string {
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

/**
 * Returns the Content-Type header value for a given FileFormat.
 */
export function fileFormatToMime(format: string): string {
  const map: Record<string, string> = {
    PDF: 'application/pdf',
    JPEG: 'image/jpeg',
    PNG: 'image/png',
    SVG: 'image/svg+xml',
    DWG: 'application/octet-stream',
  };
  return map[format] || 'application/octet-stream';
}