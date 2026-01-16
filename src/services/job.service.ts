import * as repo from "../repo/job.repo"

// CREATE SERVICE
export const createJobService = async (data: any) => {
  const jobPayload = {
    ...data,         
    status: "Active",
    applicants: 0,
  };

  const createdJob = await repo.jobRepo.create(jobPayload);
  return createdJob;
};


// GET ALL SERVICE
export const getAllJobsService = async (
  tenantId: string,
  page: number,
  limit: number,
  search?: string
) => {
  let query: any = { tenantId };

  if (search && search.trim() !== "") {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }

  return await repo.jobRepo.findAll(page, limit, query);
};


// UPDATE SERVICE
export const updateJobService = async (
  tenantId: string,
  jobId: string,
  updateData: any
) => {
  delete updateData.tenantId;

  const updatedJob = await repo.jobRepo.updateByTenant(
    jobId,
    tenantId,
    updateData
  );

  if (!updatedJob) {
    throw new Error("Job posting not found or tenant mismatch");
  }

  return {
    message: "Job updated successfully",
    jobId,
    updatedJob,
  };
};


// DELETE SERVICE
export const deleteJobService = async (
  tenantId: string,
  jobId: string
) => {
  const result = await repo.jobRepo.deleteByTenant(
    jobId,
    tenantId
  );

  if (!result) {
    throw new Error("Could not find job to delete");
  }

  return {
    message: `Job deleted successfully with id : ${jobId}`,
  };
};
