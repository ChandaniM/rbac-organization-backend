import Job from "../models/job.modal";

export const jobRepo = {
  // CREATE
  create: async (jobData: any) => {
    return await Job.create(jobData);
  },

  // READ ALL (tenant + pagination + search)
  findAll: async (
    page: number,
    limit: number,
    query: any
  ) => {
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(query),
    ]);

    return {
      data: jobs,
      pagination: {
        totalRecords: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // READ ONE (tenant-safe)
  findByJobIdAndTenant: async (
    jobId: string,
    tenantId: string
  ) => {
    return await Job.findOne({
      _id: jobId,
      tenantId,
    });
  },

  // UPDATE (tenant-safe)
  updateByTenant: async (
    jobId: string,
    tenantId: string,
    updateData: any
  ) => {
    return await Job.findOneAndUpdate(
      { _id: jobId, tenantId },
      { $set: updateData },
      { new: true }
    );
  },

  // DELETE (tenant-safe)
  deleteByTenant: async (
    jobId: string,
    tenantId: string
  ) => {
    return await Job.findOneAndDelete({
      _id: jobId,
      tenantId,
    });
  },
};
