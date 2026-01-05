import { Schema, model, Types } from "mongoose";

const UserInvitationSchema = new Schema({
  org_id: { type: Types.ObjectId, ref: "Organization", required: true },
  email: { type: String, required: true },
  role_id: { type: Types.ObjectId, ref: "Role", required: true },

  token: { type: String, required: true, unique: true },
  expires_at: { type: Date, required: true },
  accepted: { type: Boolean, default: false },
});

UserInvitationSchema.index({ org_id: 1, email: 1 });

export const UserInvitation = model(
  "UserInvitation",
  UserInvitationSchema
);
