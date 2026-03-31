// src/workers/index.ts
import { startBackupWorker } from './backup.worker';
import { startRestoreWorker } from './restore.worker';
import { startReplicationWorker } from './replication.worker';
import { startThumbnailWorker } from './thumbnail.worker';

export function startAllWorkers() {
  console.log('[workers] Starting all background workers...');

  const backupWorker = startBackupWorker();
  const restoreWorker = startRestoreWorker();
  const replicationWorker = startReplicationWorker();
  const thumbnailWorker = startThumbnailWorker();

  console.log('[workers] All workers started');

  // Graceful shutdown
  const shutdown = async () => {
    console.log('[workers] Shutting down workers...');
    await Promise.allSettled([
      backupWorker.close(),
      restoreWorker.close(),
      replicationWorker.close(),
      thumbnailWorker.close(),
    ]);
    console.log('[workers] All workers stopped');
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return { backupWorker, restoreWorker, replicationWorker, thumbnailWorker };
}