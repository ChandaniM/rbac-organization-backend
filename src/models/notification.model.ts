// src/models/notification.model.ts
import mongoose, { Document, Model, Schema } from 'mongoose';
import {
  NotificationStatus,
  NotificationType,
  EmailEvent,
} from '../types/email.types';

export interface INotification extends Document {
  tenantId:    mongoose.Types.ObjectId;
  user_id:   mongoose.Types.ObjectId | null;
  type:      NotificationType;
  event:     EmailEvent;
  title:     string;
  body:      string;
  data:      Record<string, unknown>;
  read:      boolean;
  status:    NotificationStatus;
  sent_at:   Date | null;
  created_at: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    tenantId:   { type: Schema.Types.ObjectId, ref: 'Org',  required: true },
    user_id:  { type: Schema.Types.ObjectId, ref: 'User', default: null },
    type:     { type: String, enum: ['email', 'in_app', 'push'], required: true },
    event:    { type: String, required: true },
    title:    { type: String, required: true },
    body:     { type: String, default: '' },
    data:     { type: Schema.Types.Mixed, default: {} },
    read:     { type: Boolean, default: false },
    status:   { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    sent_at:  { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

notificationSchema.index({ tenantId: 1, user_id: 1, read: 1 });

const Notification: Model<INotification> = mongoose.model<INotification>(
  'Notification',
  notificationSchema
);

export default Notification;