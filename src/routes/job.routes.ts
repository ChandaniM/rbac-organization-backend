import { Router } from 'express';
import { createJob, deleteJob, getJobs, updateJob } from '../controllers/job.controller';
import { rateLimitPresets } from '../middlewares/rate-limit.middleware';
import { debounceMiddleware } from '../utils/debounce.util';

const router = Router();

router.post('/:tenantId/add', rateLimitPresets.api, createJob);

router.get(
  '/:tenantId/getJob',
  rateLimitPresets.search,
  debounceMiddleware(300),
  getJobs
);

router.put('/:tenantId/:jobId', rateLimitPresets.api, updateJob);

router.delete('/:tenantId/:jobId', rateLimitPresets.api, deleteJob);

export default router;