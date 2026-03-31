// src/workers/backup.worker.ts
import { Worker, Job } from 'bullmq';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { redisConnection } from '../lib/redis';

const execAsync = promisify(exec);

const BACKUP_PATH = process.env.BACKUP_PATH || path.resolve(process.cwd(), 'backups');
const FILE_STORAGE_PATH = process.env.FILE_STORAGE_PATH || path.resolve(process.cwd(), 'uploads');
const DATABASE_URL = process.env.DATABASE_URL || '';

interface BackupJobData {
  backupRecordId: string;
}

async function processBackup(job: Job<BackupJobData>) {
  const { backupRecordId } = job.data;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  const sqlFilename = `${timestamp}.sql`;
  const filesArchive = `${timestamp}-files.tar.gz`;
  const sqlPath = path.join(BACKUP_PATH, sqlFilename);
  const filesPath = path.join(BACKUP_PATH, filesArchive);

  try {
    // Ensure backup directory exists
    await fs.promises.mkdir(BACKUP_PATH, { recursive: true });

    // Update record to RUNNING
    await prisma.backupRecord.update({
      where: { id: backupRecordId },
      data: { status: 'RUNNING', filePath: sqlPath },
    });

    job.updateProgress(10);

    // Step 1: pg_dump database
    console.log(`[backup] Starting pg_dump for backup ${backupRecordId}`);
    await execAsync(`pg_dump "${DATABASE_URL}" > "${sqlPath}"`);
    job.updateProgress(50);

    // Step 2: Archive uploaded files
    console.log(`[backup] Creating files archive for backup ${backupRecordId}`);
    if (fs.existsSync(FILE_STORAGE_PATH)) {
      await execAsync(`tar -czf "${filesPath}" -C "${FILE_STORAGE_PATH}" .`);
    }
    job.updateProgress(80);

    // Calculate total size
    let totalSizeBytes = BigInt(0);
    if (fs.existsSync(sqlPath)) {
      const sqlStat = await fs.promises.stat(sqlPath);
      totalSizeBytes += BigInt(sqlStat.size);
    }
    if (fs.existsSync(filesPath)) {
      const filesStat = await fs.promises.stat(filesPath);
      totalSizeBytes += BigInt(filesStat.size);
    }

    // Update record to SUCCESS
    await prisma.backupRecord.update({
      where: { id: backupRecordId },
      data: {
        status: 'SUCCESS',
        completedAt: new Date(),
        sizeBytes: totalSizeBytes,
        filePath: sqlPath,
      },
    });

    job.updateProgress(100);
    console.log(`[backup] Backup ${backupRecordId} completed successfully`);

    return { success: true, sqlPath, filesPath, sizeBytes: totalSizeBytes.toString() };
  } catch (error: any) {
    console.error(`[backup] Backup ${backupRecordId} failed:`, error.message);

    // Update record to FAILED
    await prisma.backupRecord.update({
      where: { id: backupRecordId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
      },
    });

    throw error;
  }
}

export function startBackupWorker() {

  const worker = new Worker<BackupJobData>('backup', processBackup, {
    connection: redisConnection,
    concurrency: 1, // Only one backup at a time
  });

  worker.on('completed', (job) => {
    console.log(`[backup] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[backup] Job ${job?.id} failed:`, err.message);
  });

  console.log('[backup] Backup worker started');
  return worker;
}