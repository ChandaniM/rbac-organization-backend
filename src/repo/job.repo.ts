import Job from '../models/job.modal';

export const jobRepo = {
  // Create
  create: async (jobData: any) => {
    return await Job.create(jobData);
  },

  // Read All
  // findAll: async (page: number, limit: number) => {
  //   return await Job.find().sort({ createdAt: -1 });
  // },
  findAll: async (
    page: number,
    limit: number,
    query: any = {}
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
  
  
  // Read One
  findByJobId: async (jobId: string) => {
    return await Job.findOne({ _id: jobId });
  },

  // Update
  update: async (jobId: string, updateData: any) => {
    return await Job.findOneAndUpdate({ _id: jobId },{ $set: updateData}, { new: true });
  },

  // Delete
  delete: async (jobId: string) => {
    return await Job.findOneAndDelete({ _id:jobId });
  }
};