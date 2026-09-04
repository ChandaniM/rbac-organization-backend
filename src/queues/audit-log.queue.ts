import Bull from 'bull';
import { AuditLog } from '../models/audit-log.model';
import { bullRedisConfig } from '../config/redis.config';

export interface AuditLogJob {
  tenantId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string;
  entity: string;
  entityId?: string;
  entityName?: string;
  details?: Record<string, any>;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestUrl?: string;
  responseStatus?: number;
  responseTime?: number;
  errorMessage?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

const auditLogQueue = new Bull<AuditLogJob>('audit-logs', {
  redis: {
    ...bullRedisConfig,
  },
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 1000,
    removeOnFail: 500,
  },
});

let batch: AuditLogJob[] = [];
const BATCH_SIZE = 50;
const BATCH_TIMEOUT = 5000;
let batchTimer: NodeJS.Timeout | null = null;

const flushBatch = async () => {
  if (batch.length === 0) return;

  const logsToInsert = [...batch];
  batch = [];

  try {
    await AuditLog.insertMany(
      logsToInsert.map(log => ({
        ...log,
        timestamp: new Date(),
      }))
    );
    console.log(`[AuditLogQueue] ✅ Batch inserted ${logsToInsert.length} audit logs`);
  } catch (error) {
    console.error('[AuditLogQueue] ❌ Batch insert failed:', error);
  }
};

auditLogQueue.process(async (job) => {
  const logData = job.data;

  batch.push(logData);

  if (batch.length >= BATCH_SIZE) {
    if (batchTimer) {
      clearTimeout(batchTimer);
      batchTimer = null;
    }
    await flushBatch();
  } else if (!batchTimer) {
    batchTimer = setTimeout(async () => {
      await flushBatch();
      batchTimer = null;
    }, BATCH_TIMEOUT);
  }

  return { success: true, batchSize: batch.length };
});

auditLogQueue.on('completed', (job) => {
  console.log(`[AuditLogQueue] Job ${job.id} completed`);
});

auditLogQueue.on('failed', (job, error) => {
  console.error(`[AuditLogQueue] Job ${job?.id} failed:`, error.message);
});

export const addAuditLogToQueue = async (data: AuditLogJob): Promise<Bull.Job<AuditLogJob>> => {
  return auditLogQueue.add(data, {
    priority: 5,
  });
};

export const getAuditQueueStats = async () => {
  const [waiting, active, completed, failed] = await Promise.all([
    auditLogQueue.getWaitingCount(),
    auditLogQueue.getActiveCount(),
    auditLogQueue.getCompletedCount(),
    auditLogQueue.getFailedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    batchSize: batch.length,
  };
};

process.on('SIGTERM', async () => {
  console.log('[AuditLogQueue] SIGTERM received, flushing batch...');
  await flushBatch();
});

process.on('SIGINT', async () => {
  console.log('[AuditLogQueue] SIGINT received, flushing batch...');
  await flushBatch();
});

export default auditLogQueue;
