import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  tenantId: string;
  name: string;
  description?: string;
  key: string; // Short identifier (e.g., "PROJ", "DEV")
  status: 'Active' | 'On Hold' | 'Completed' | 'Archived';
  priority: 'Low' | 'Medium' | 'High';
  manager: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId[];
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 10,
    },
    status: {
      type: String,
      enum: ['Active', 'On Hold', 'Completed', 'Archived'],
      default: 'Active',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    team: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    budget: {
      type: Number,
      min: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
projectSchema.index({ tenantId: 1, status: 1 });
projectSchema.index({ tenantId: 1, manager: 1 });
projectSchema.index({ tenantId: 1, key: 1 }, { unique: true });

// Virtual for task count (populate separately)
projectSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'projectId',
  count: true,
});

export const Project = mongoose.model<IProject>('Project', projectSchema);
