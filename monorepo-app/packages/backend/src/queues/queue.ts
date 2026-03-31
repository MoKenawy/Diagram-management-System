import { Queue } from 'bullmq';
import { redisConnection } from '../lib/redis';

export const backupQueue = new Queue('backup', {   connection: redisConnection, });
export const restoreQueue = new Queue('restore', { connection: redisConnection, });
export const replicationQueue = new Queue('replication', { connection: redisConnection });