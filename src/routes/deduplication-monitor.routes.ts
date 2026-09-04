import { Router, Request, Response } from 'express';
import { requestDeduplication } from '../utils/request-deduplication.util';
import { authenticate } from '../middlewares/jwt.middleware';

const router = Router();

/**
 * GET /api/monitoring/deduplication-stats
 * 
 * Returns statistics about request deduplication:
 * - How many requests are currently being deduplicated
 * - How many callers are waiting for each request
 * - Request ages
 */
router.get('/deduplication-stats', authenticate, async (req: Request, res: Response) => {
  try {
    const stats = requestDeduplication.getStats();
    
    res.json({
      ...stats,
      timestamp: new Date().toISOString(),
      description: 'Requests currently being deduplicated (concurrent identical requests merged)',
    });
  } catch (error) {
    console.error('Error fetching deduplication stats:', error);
    res.status(500).json({ error: 'Failed to fetch deduplication statistics' });
  }
});

export default router;
