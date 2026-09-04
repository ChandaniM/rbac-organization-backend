import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  tenantId: string;
  projectId: mongoose.Types.ObjectId;
  taskNumber: number; // Auto-increment per project (e.g., PROJ-1, PROJ-2)
  title: string;
  description?: string;
  status: string; // Customizable per project
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  type: 'Task' | 'Bug' | 'Feature' | 'Epic' | 'Story';
  assignee?: mongoose.Types.ObjectId;
  reporter: mongoose.Types.ObjectId;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: string[];
  watchers: mongoose.Types.ObjectId[];
  parentTask?: mongoose.Types.ObjectId; // For sub-tasks
  order: number; // For Kanban ordering within column
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    taskNumber: {
      type: Number,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      default: 'To Do',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    type: {
      type: String,
      enum: ['Task', 'Bug', 'Feature', 'Epic', 'Story'],
      default: 'Task',
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
    },
    estimatedHours: {
      type: Number,
      min: 0,
    },
    actualHours: {
      type: Number,
      min: 0,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    attachments: [
      {
        type: String, // S3 URLs
      },
    ],
    watchers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    parentTask: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
taskSchema.index({ tenantId: 1, projectId: 1 });
taskSchema.index({ tenantId: 1, assignee: 1 });
taskSchema.index({ tenantId: 1, status: 1 });
taskSchema.index({ tenantId: 1, projectId: 1, taskNumber: 1 }, { unique: true });
taskSchema.index({ tenantId: 1, projectId: 1, status: 1, order: 1 }); // For Kanban

// Auto-increment taskNumber per project
taskSchema.pre('save', async function () {
  if (this.isNew && !this.taskNumber) {
    const lastTask = await mongoose.model('Task').findOne({
      projectId: this.projectId,
    }).sort({ taskNumber: -1 });
    
    this.taskNumber = lastTask ? lastTask.taskNumber + 1 : 1;
  }
});

// Virtual for task identifier (e.g., "PROJ-123")
taskSchema.virtual('identifier').get(function () {
  return `${this.projectId}-${this.taskNumber}`;
});

export const Task = mongoose.model<ITask>('Task', taskSchema);
