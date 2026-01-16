import mongoose, { Schema } from 'mongoose';

export interface IJob {
  tenantId: string;
  title: string;
  department: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  status: 'Active' | 'Closed' | 'Draft';
  applicants: number;
  description?: string;
  experience?: string;
  location?: string;
  salary?: number;
}

const JobSchema = new Schema<IJob>({
  tenantId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Closed', 'Draft'],
    default: 'Active'
  },
  applicants: {
    type: Number,
    default: 0
  },
  description: String,
  experience: String,
  location: String,
  salary: Number
}, { timestamps: true });

JobSchema.index({ tenantId: 1, _id: 1 });

export default mongoose.model<IJob>('Job', JobSchema);
