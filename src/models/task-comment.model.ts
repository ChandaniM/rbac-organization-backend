import mongoose, { Document, Schema } from 'mongoose';

export interface ITaskComment extends Document {
  tenantId: string;
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  mentions: mongoose.Types.ObjectId[]; // @mentioned users
  attachments: string[];
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const taskCommentSchema = new Schema<ITaskComment>(
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
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    attachments: [
      {
        type: String, // S3 URLs
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
taskCommentSchema.index({ tenantId: 1, taskId: 1, createdAt: -1 });

export const TaskComment = mongoose.model<ITaskComment>('TaskComment', taskCommentSchema);
