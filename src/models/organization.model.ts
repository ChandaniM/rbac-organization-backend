import { Schema, model, Types } from "mongoose";

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true },
    display_name: { type: String },
    description: { type: String },
    status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
    parent_id: {
      type: Types.ObjectId,
      ref: "Organization",
      default: null,
    },
    created_by:{ type: String },
    updated_by: { type: String },
  },
  { timestamps: true }
);

OrganizationSchema.index({ name: 1 }, { unique: true });
OrganizationSchema.index({ parent_id: 1 });

export const Organization = model("Organization", OrganizationSchema);
