// src/workers/replication.worker.ts
import { Worker, Job } from 'bullmq';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { redisConnection } from '../lib/redis';

const execAsync = promisify(exec);

const FILE_STORAGE_PATH = process.env.FILE_STORAGE_PATH || path.resolve(process.cwd(), 'uploads');
const BACKUP_PATH = process.env.BACKUP_PATH || path.resolve(process.cwd(), 'backups');
const DATABASE_URL = process.env.DATABASE_URL || '';

interface ReplicationJobData {
  targetId: string;
}

async function processReplication(job: Job<ReplicationJobData>) {
  const { targetId } = job.data;

  try {
    // Load replication target
    const target = await prisma.replicationTarget.findUnique({
      where: { id: targetId },
    });

    if (!target) {
      throw new Error(`Replication target ${targetId} not found`);
    }

    if (!target.isActive) {
      throw new Error(`Replication target ${target.label} is inactive`);
    }

    const sshOptions = `-o StrictHostKeyChecking=no -i "${target.sshKeyPath}"`;
    const remoteHost = `${target.sshUsername}@${target.host}`;
    const sshPort = target.port || 22;

    job.updateProgress(10);

    // Step 1: rsync files to remote host
    console.log(`[replication] Syncing files to ${target.label} (${target.host})`);
    if (fs.existsSync(FILE_STORAGE_PATH)) {
      await execAsync(
        `rsync -avz --delete -e "ssh -p ${sshPort} ${sshOptions}" "${FILE_STORAGE_PATH}/" ${remoteHost}:~/replicated-files/`
      );
    }
    job.updateProgress(50);

    // Step 2: pg_dump and scp SQL to remote
    console.log(`[replication] Creating and sending database dump to ${target.label}`);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dumpFile = path.join(BACKUP_PATH, `replication-${timestamp}.sql`);

    await fs.promises.mkdir(BACKUP_PATH, { recursive: true });
    await execAsync(`pg_dump "${DATABASE_URL}" > "${dumpFile}"`);
    job.updateProgress(70);

    await execAsync(
      `scp -P ${sshPort} ${sshOptions} "${dumpFile}" ${remoteHost}:~/replicated-db.sql`
    );
    job.updateProgress(90);

    // Clean up local temp dump
    if (fs.existsSync(dumpFile)) {
      await fs.promises.unlink(dumpFile);
    }

    // Update target sync status
    await prisma.replicationTarget.update({
      where: { id: targetId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: 'SUCCESS',
      },
    });

    job.updateProgress(100);
    console.log(`[replication] Replication to ${target.label} completed successfully`);

    return { success: true, targetId: target.id, label: target.label };
  } catch (error: any) {
    console.error(`[replication] Replication to target ${targetId} failed:`, error.message);

    // Update target sync status to FAILED
    try {
      await prisma.replicationTarget.update({
        where: { id: targetId },
        data: {
          lastSyncAt: new Date(),
          lastSyncStatus: 'FAILED',
        },
      });
    } catch (updateErr) {
      console.error('[replication] Failed to update sync status:', updateErr);
    }

    throw error;
  }
}

export function startReplicationWorker() {

  const worker = new Worker<ReplicationJobData>('replication', processReplication, {
    connection: redisConnection,
    concurrency: 2,
  });

  worker.on('completed', (job) => {
    console.log(`[replication] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[replication] Job ${job?.id} failed:`, err.message);
  });

  console.log('[replication] Replication worker started');
  return worker;
}