import { Schema, model, Types } from 'mongoose';
export interface IUser extends Document {
  _id: Types.ObjectId;
  tenantId: string;
  username: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  email_verified: boolean;
  // is_org_admin: boolean;
  created_at: Date;
}
const UserSchema = new Schema(
  {
    tenantId: { 
      type: String, 
      required: true, 
      trim: true 
    },
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password_hash: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    email_verified: { type: Boolean, default: false, trim: true },
    // is_org_admin: {
    //   type: Boolean,
    //   default: false,
    // }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } },
);

UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });
UserSchema.index({ email: 1 });

export const User = model<IUser>('User', UserSchema);