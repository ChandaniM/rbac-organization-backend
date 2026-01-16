import { Schema, model, Types } from "mongoose";

const UserHierarchySchema = new Schema(
  {
    tenantId: { type: Types.ObjectId, ref: "Organization", required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    managerId: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: "assigned_at", updatedAt: false } }
);

UserHierarchySchema.index({ tenantId: 1, userId: 1 }, { unique: true });
UserHierarchySchema.index({ tenantId: 1, managerId: 1 });

export const UserHierarchy = model("UserHierarchy", UserHierarchySchema);
