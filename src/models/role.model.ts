import { Schema, model, Types } from "mongoose";

const RoleSchema = new Schema(
  {
    tenantId: { type: Types.ObjectId, ref: "Organization", required: true },
    name: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

RoleSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export const Role = model("Role", RoleSchema);
