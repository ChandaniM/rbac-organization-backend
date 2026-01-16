
import { Request, Response } from "express";
import { createJobService, deleteJobService, getAllJobsService, updateJobService } from "../services/job.service";


// CREATE: Post a new job
export const createJob = async (req:Request, res:Response) => {
  try {
    const { tenantId } = req.params;
    const newJob = {
      ...req.body,
      tenantId,
    };
    console.log(newJob ,"this is job")
   let savedJob = await createJobService(newJob);
    res.status(201).json(savedJob);
  } catch (err:any) {
    res.status(400).json({ message: err.message });
  }
};

// READ: Get all jobs
export const getJobs = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = (req.query.search as string) || "";

    const jobs = await getAllJobsService(
      tenantId,
      page,
      limit,
      search
    );

    res.status(200).json(jobs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};


// UPDATE: Edit a job using its jobId
export const updateJob = async (req: Request, res: Response) => {
  try {
    const { tenantId, jobId } = req.params;

    const updatedJob = await updateJobService(
      tenantId,
      jobId,
      req.body
    );

    res.status(200).json(updatedJob);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};


// DELETE: Remove a job
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { tenantId, jobId } = req.params;

    const deletedJob = await deleteJobService(
      tenantId,
      jobId
    );

    res.status(200).json(deletedJob);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
