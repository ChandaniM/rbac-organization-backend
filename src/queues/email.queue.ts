import Bull from 'bull';
import { bullRedisConfig } from '../config/redis.config';
import { sendRawEmail } from '../services/email.service';
import { EmailEvent } from '../types/email.types';

export interface EmailJob {
  to: string;
  subject: string;
  html: string;
  event: EmailEvent;
  tenantId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

const emailQueue = new Bull<EmailJob>('email-notifications', {
  redis: {
    ...bullRedisConfig,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

emailQueue.process(async (job) => {
  const { to, subject, html, event, metadata } = job.data;

  console.log(`[EmailQueue] Processing email job ${job.id} for event: ${event}`);

  try {
    await sendRawEmail({ to, subject, html });
    
    console.log(`[EmailQueue] ✅ Email sent successfully - Job ${job.id}`);
    
    return {
      success: true,
      jobId: job.id,
      event,
      sentAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[EmailQueue] ❌ Failed to send email - Job ${job.id}:`, error);
    throw error;
  }
});

emailQueue.on('completed', (job, result) => {
  console.log(`[EmailQueue] Job ${job.id} completed:`, result);
});

emailQueue.on('failed', (job, error) => {
  console.error(`[EmailQueue] Job ${job?.id} failed after ${job?.attemptsMade} attempts:`, error.message);
});

emailQueue.on('stalled', (job) => {
  console.warn(`[EmailQueue] Job ${job.id} stalled`);
});

export const addEmailToQueue = async (data: EmailJob, priority?: number): Promise<Bull.Job<EmailJob>> => {
  return emailQueue.add(data, {
    priority: priority || 10,
    attempts: 3,
  });
};

export const getQueueStats = async () => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    emailQueue.getWaitingCount(),
    emailQueue.getActiveCount(),
    emailQueue.getCompletedCount(),
    emailQueue.getFailedCount(),
    emailQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
};

export default emailQueue;
