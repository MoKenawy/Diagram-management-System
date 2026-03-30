import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export interface ThumbnailJobData {
  versionId: string;
  filePath: string;
  fileFormat: string;
}

export const thumbnailQueue = new Queue<ThumbnailJobData>('thumbnail', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 86400, // 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 604800, // 7 days
    },
  },
});

export async function enqueueThumbnailJob(data: ThumbnailJobData): Promise<void> {
  await thumbnailQueue.add('generate-thumbnail', data, {
    jobId: `thumb-${data.versionId}`,
  });
}