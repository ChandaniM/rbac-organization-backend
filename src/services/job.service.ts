import * as repo from "../repo/job.repo"

// CREATE SERVICE
export const createJobService = async (data: any) => {
  // const { title, department, type } = data;
  const jobPayload = {
    ...data,
    status: 'Active',
    applicants: 0
  };

  const createdJob = await repo.jobRepo.create(jobPayload);
  console.log(createdJob , "this is job created ye");
  
  return createdJob;
};

// GET ALL SERVICE
export const getAllJobsService = async (page: number, limit: number, search?:string) => {
  let query: any = {};

  if (search && search.trim() !== "") {
    query = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ],
    };
  }
  return await repo.jobRepo.findAll(page,limit,query);
};

// UPDATE SERVICE
export const updateJobService = async (jobId: string, updateData: any) => {
  const keys = Object.keys(updateData);

  const newObj: Record<string, unknown> = {};
  for (const key of keys) {
    newObj[key] = updateData[key];
  }

  const existingJob = await repo.jobRepo.findByJobId(jobId);
  if (!existingJob) {
    throw new Error('Job posting not found');
  }

  await repo.jobRepo.update(jobId, newObj);

  return {
    message: 'Job updated successfully',
    jobId,
    updatedFields: newObj
  };
};

// DELETE SERVICE
export const deleteJobService = async (jobId: string) => {
  const result = await repo.jobRepo.delete(jobId);
  if (!result) {
    throw new Error('Could not find job to delete');
  }
  return { message: `Job deleted successfully with id : ${jobId}` };
};