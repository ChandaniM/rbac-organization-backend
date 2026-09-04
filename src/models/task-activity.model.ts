import mongoose, { Document, Schema } from 'mongoose';

export interface ITaskActivity extends Document {
  tenantId: string;
  taskId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string; // 'created', 'updated', 'status_changed', 'assigned', 'commented', etc.
  field?: string; // Field that changed (for updates)
  oldValue?: any;
  newValue?: any;
  description: string; // Human-readable description
  metadata?: Record<string, any>;
  createdAt: Date;
}

const taskActivitySchema = new Schema<ITaskActivity>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'created',
        'updated',
        'status_changed',
        'assigned',
        'unassigned',
        'priority_changed',
        'due_date_changed',
        'commented',
        'attachment_added',
        'attachment_removed',
        'deleted',
      ],
    },
    field: {
      type: String,
    },
    oldValue: {
      type: Schema.Types.Mixed,
    },
    newValue: {
      type: Schema.Types.Mixed,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes for querying activity
taskActivitySchema.index({ tenantId: 1, projectId: 1, createdAt: -1 });
taskActivitySchema.index({ tenantId: 1, taskId: 1, createdAt: -1 });
taskActivitySchema.index({ tenantId: 1, userId: 1, createdAt: -1 });

export const TaskActivity = mongoose.model<ITaskActivity>('TaskActivity', taskActivitySchema);
