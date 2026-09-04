import { Router, Request, Response } from 'express';
import { getQueueStats as getEmailQueueStats } from '../queues/email.queue';
import { getAuditQueueStats } from '../queues/audit-log.queue';
import { authenticate } from '../middlewares/jwt.middleware';

const router = Router();

router.get('/queue-stats', authenticate, async (req: Request, res: Response) => {
  try {
    const [emailStats, auditStats] = await Promise.all([
      getEmailQueueStats(),
      getAuditQueueStats(),
    ]);

    res.json({
      emailQueue: emailStats,
      auditLogQueue: auditStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching queue stats:', error);
    res.status(500).json({ error: 'Failed to fetch queue statistics' });
  }
});

export default router;
