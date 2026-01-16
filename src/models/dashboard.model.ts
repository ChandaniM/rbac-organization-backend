import { Schema, model, Types } from "mongoose";

const DashboardSchema = new Schema({
  tenantId: { type: Types.ObjectId, ref: "Organization", required: true, unique: true },
  logo_url: { type: String },
  config: { type: Schema.Types.Mixed }, // flexible JSON config
});

DashboardSchema.index({ tenantId: 1 });

export const Dashboard = model("Dashboard", DashboardSchema);
