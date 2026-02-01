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
    branding: {
      logo: {
        type: String, // URL
      },
      primaryColor: {
        type: String,
        default: "#000000",
      },
      secondaryColor: {
        type: String,
        default: "#ffffff",
      },
      theme: {
        type: String,
        enum: ["light", "dark", "custom"],
        default: "light",
      },
    },
    policies: [
      {
        title: { type: String },
        description: { type: String },
        documentUrl: { type: String }, // PDF / DOC
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    is_deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

OrganizationSchema.index({ name: 1 }, { unique: true });
OrganizationSchema.index({ parent_id: 1 });
OrganizationSchema.index({ status: 1, is_deleted: 1 });


export const Organization = model("Organization", OrganizationSchema);
