import { Router } from 'express';

import { authenticate } from '../middlewares/jwt.middleware';
import { getDashboardMetrics } from '../controllers/dashboard.controller';

const router = Router();

router.get('/dashboard', authenticate, getDashboardMetrics);

export default router;
