import { Schema, model, Types } from "mongoose";

const UserHierarchySchema = new Schema({
  user_id: { type: Types.ObjectId, ref: "User", required: true },
  manager_id: { type: Types.ObjectId, ref: "User", required: true },
});

UserHierarchySchema.index({ user_id: 1 }, { unique: true });
UserHierarchySchema.index({ manager_id: 1 });

export const UserHierarchy = model(
  "UserHierarchy",
  UserHierarchySchema
);
