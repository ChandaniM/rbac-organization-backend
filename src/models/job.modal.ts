import mongoose, { Schema } from 'mongoose';

export interface IJob {
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

export default mongoose.model<IJob>('Job', JobSchema);
