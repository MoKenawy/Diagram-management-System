// src/workers/thumbnail.worker.ts (unchanged except for logging)
import { Worker, Job } from 'bullmq';
import path from 'path';
import { prisma } from '../lib/prisma';
import { redisConnection } from '../lib/redis';
import { generateThumbnail } from '../utils/thumbnail';
import { ThumbnailJobData } from '../queues/thumbnail.queue';
import { logger } from '../utils/logger';

const THUMBNAIL_OUTPUT_DIR =
  process.env.THUMBNAIL_PATH || path.resolve(process.cwd(), 'uploads', 'thumbnails');

const log = logger.child({ worker: 'thumbnail' });

async function processThumbnail(job: Job<ThumbnailJobData>) {
  const { versionId, filePath, fileFormat } = job.data;

  log.info(
    { versionId, fileFormat, filePath },
    'Processing thumbnail'
  );

  const thumbnailPath = await generateThumbnail(
    filePath,
    fileFormat,
    THUMBNAIL_OUTPUT_DIR
  );

  if (thumbnailPath) {
    await prisma.diagramVersion.update({
      where: { id: versionId },
      data: { thumbnailPath },
    });

    log.info(
      { versionId, thumbnailPath },
      'Thumbnail saved'
    );
  } else {
    log.warn(
      { versionId, fileFormat },
      'No thumbnail generated'
    );
  }

  return { versionId, thumbnailPath };
}

export function startThumbnailWorker() {

  const worker = new Worker<ThumbnailJobData>('thumbnail', processThumbnail, {
    connection: redisConnection,
    concurrency: 3,
  });

  worker.on('completed', (job) => {
    log.debug({ jobId: job.id }, 'Job completed');
  });

  worker.on('failed', (job, err) => {
    log.error(
      { jobId: job?.id, error: err.message },
      'Job failed'
    );
  });

  log.info('Thumbnail worker started');
  return worker;
}