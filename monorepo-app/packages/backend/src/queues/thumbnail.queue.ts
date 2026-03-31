// src/queues/thumbnail.queue.ts
import { Queue } from 'bullmq';
import { redisConnection } from '../lib/redis';

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
      delay: 5000,
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
});