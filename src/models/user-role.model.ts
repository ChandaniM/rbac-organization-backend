import { Schema, model, Types } from "mongoose";

const UserRoleSchema = new Schema({
  user_id: { type: Types.ObjectId, ref: "User", required: true },
  role_id: { type: Types.ObjectId, ref: "Role", required: true },
  assigned_at: { type: Date, default: Date.now },
  tenantId: { type: String, required: true, index: true },
});

UserRoleSchema.index(
  { tenantId: 1, user_id: 1, role_id: 1 },
  { unique: true }
);
export const UserRole = model("UserRole", UserRoleSchema);
