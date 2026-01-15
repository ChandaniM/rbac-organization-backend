
import { Request, Response } from "express";
import { createJobService, deleteJobService, getAllJobsService, updateJobService } from "../services/job.service";


// CREATE: Post a new job
export const createJob = async (req:Request, res:Response) => {
  try {
    const newJob = req.body;
    console.log(newJob ,"this is job")
   let savedJob = await createJobService(newJob);
    res.status(201).json(savedJob);
  } catch (err:any) {
    res.status(400).json({ message: err.message });
  }
};

// READ: Get all jobs
export const getJobs = async (req:Request, res:Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    let search = req.query.search as string | "";
    const jobs = await getAllJobsService(page, limit , search);
    res.status(200).json(jobs);
  } catch (err:any) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE: Edit a job using its jobId
export const updateJob = async (req:Request, res:Response) => {
  
  try {
    const { jobId } = req.params;
    let updateJob = await updateJobService(jobId , req.body)
    res.status(200).json(updateJob);
  } catch (err:any) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE: Remove a job
export const deleteJob = async (req:Request, res:Response) => {
  try {
    let {jobId } = req.params;
    let deletedJob = await deleteJobService(jobId)
    res.status(200).json({deletedJob});
  } catch (err:any) {
    res.status(500).json({ message: err.message });
  }
};