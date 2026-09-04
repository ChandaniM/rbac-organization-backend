import { Router } from 'express';

import { authenticate } from '../middlewares/jwt.middleware';
import { getDashboardMetrics } from '../controllers/dashboard.controller';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

router.get(
  '/dashboard',
  authenticate,
  cacheMiddleware({ ttl: 300, prefix: 'dashboard' }),
  getDashboardMetrics
);

export default router;
