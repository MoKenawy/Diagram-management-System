import { Worker, Job } from 'bullmq';
import path from 'path';
import { prisma } from '../lib/prisma';
import { redisConnection } from '../config/redis';
import { generateThumbnail } from '../utils/thumbnail';
import { ThumbnailJobData } from '../queues/thumbnail.queue';


const THUMBNAIL_OUTPUT_DIR = process.env.THUMBNAIL_STORAGE_PATH || './uploads/thumbnails';

const thumbnailWorker = new Worker<ThumbnailJobData>(
  'thumbnail',
  async (job: Job<ThumbnailJobData>) => {
    const { versionId, filePath, fileFormat } = job.data;

    console.log(`Processing thumbnail for version ${versionId}, file: ${filePath}`);

    const outputDir = path.join(
      THUMBNAIL_OUTPUT_DIR,
      new Date().getFullYear().toString(),
      (new Date().getMonth() + 1).toString().padStart(2, '0')
    );

    const thumbnailPath = await generateThumbnail(filePath, fileFormat, outputDir);

    if (thumbnailPath) {
      await prisma.diagramVersion.update({
        where: { id: versionId },
        data: { thumbnailPath },
      });

      console.log(`Thumbnail generated for version ${versionId}: ${thumbnailPath}`);
    } else {
      console.log(`No thumbnail generated for version ${versionId} (format: ${fileFormat})`);
    }

    return { versionId, thumbnailPath };
  },
  {
    connection: redisConnection,
    concurrency: 2,
    limiter: {
      max: 5,
      duration: 1000,
    },
  }
);

thumbnailWorker.on('completed', (job) => {
  console.log(`Thumbnail job ${job.id} completed`);
});

thumbnailWorker.on('failed', (job, err) => {
  console.error(`Thumbnail job ${job?.id} failed:`, err.message);
});

export { thumbnailWorker };