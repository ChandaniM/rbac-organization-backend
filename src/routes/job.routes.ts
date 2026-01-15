import { Router } from 'express';
import { createJob, deleteJob, getJobs, updateJob } from '../controllers/job.controller';
const router = Router();

// 1. Create a Job
router.post('/add', createJob);

// 2. Get All Jobs (for your Dynamic Table)
router.get('/getJob', getJobs);

// 3. Update a Job by its custom jobId (e.g., J1768...)
router.put('/:jobId', updateJob);

// 4. Delete a Job
router.delete('/:jobId', deleteJob);

export default router;