import { Schema, model, Types } from 'mongoose';

const AnnouncementSchema = new Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true,
    },
    createdBy: {
      type: String,
      index: true,
    },
  },
  { timestamps: true },
);

/**
 * Tenant isolation + latest first
 */
AnnouncementSchema.index({ tenantId: 1, createdAt: -1 });

/**
 * Full-text search
 */
AnnouncementSchema.index({
  title: 'text',
  description: 'text',
});

export const AnnouncementModel = model('Announcement', AnnouncementSchema);
