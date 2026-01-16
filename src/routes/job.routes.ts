import { Router } from 'express';
import { createJob, deleteJob, getJobs, updateJob } from '../controllers/job.controller';
const router = Router();

// 1. Create a Job
router.post('/:tenantId/add', createJob);

// 2. Get All Jobs (for your Dynamic Table)
router.get('/:tenantId/getJob', getJobs);

// 3. Update a Job by jobId
router.put('/:tenantId/:jobId', updateJob);

// 4. Delete a Job
router.delete('/:tenantId/:jobId', deleteJob);

export default router;