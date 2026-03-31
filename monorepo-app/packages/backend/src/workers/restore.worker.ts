// src/workers/restore.worker.ts
import { Worker, Job } from 'bullmq';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { redisConnection } from '../lib/redis';
import { logAction } from '../services/audit.service';

const execAsync = promisify(exec);

const FILE_STORAGE_PATH = process.env.FILE_STORAGE_PATH || path.resolve(process.cwd(), 'uploads');
const DATABASE_URL = process.env.DATABASE_URL || '';

interface RestoreJobData {
  backupRecordId: string;
}

async function processRestore(job: Job<RestoreJobData>) {
  const { backupRecordId } = job.data;

  try {
    // Load backup record
    const backup = await prisma.backupRecord.findUnique({
      where: { id: backupRecordId },
    });

    if (!backup) {
      throw new Error(`Backup record ${backupRecordId} not found`);
    }

    if (!backup.filePath || !fs.existsSync(backup.filePath)) {
      throw new Error(`Backup SQL file not found at ${backup.filePath}`);
    }

    job.updateProgress(10);

    // Step 1: Restore database from SQL dump
    console.log(`[restore] Restoring database from ${backup.filePath}`);
    await execAsync(`psql "${DATABASE_URL}" < "${backup.filePath}"`);
    job.updateProgress(50);

    // Step 2: Restore files from tar archive (if exists)
    const filesArchivePath = backup.filePath.replace('.sql', '-files.tar.gz');
    if (fs.existsSync(filesArchivePath)) {
      console.log(`[restore] Extracting files from ${filesArchivePath}`);
      await fs.promises.mkdir(FILE_STORAGE_PATH, { recursive: true });
      await execAsync(`tar -xzf "${filesArchivePath}" -C "${FILE_STORAGE_PATH}"`);
    }
    job.updateProgress(90);

    // Log completion
    await logAction({
      action: 'RESTORE_COMPLETED',
      targetType: 'BACKUP',
      targetId: backupRecordId,
      metadata: {
        filePath: backup.filePath,
        restoredAt: new Date().toISOString(),
      },
    });

    job.updateProgress(100);
    console.log(`[restore] Restore from backup ${backupRecordId} completed successfully`);

    return { success: true };
  } catch (error: any) {
    console.error(`[restore] Restore from backup ${backupRecordId} failed:`, error.message);

    await logAction({
      action: 'RESTORE_FAILED',
      targetType: 'BACKUP',
      targetId: backupRecordId,
      metadata: { error: error.message },
    });

    throw error;
  }
}

export function startRestoreWorker() {

  const worker = new Worker<RestoreJobData>('restore', processRestore, {
    connection: redisConnection,
    concurrency: 1,
  });

  worker.on('completed', (job) => {
    console.log(`[restore] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[restore] Job ${job?.id} failed:`, err.message);
  });

  console.log('[restore] Restore worker started');
  return worker;
}