import { Schema, model, Types } from 'mongoose';

const UserSchema = new Schema(
  {
    tenantId: { type: Types.ObjectId, ref: 'Organization', required: true },
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password_hash: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    email_verified: { type: Boolean, default: false, trim: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } },
);

UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });
UserSchema.index({ email: 1 });

export const User = model('User', UserSchema);
