import { Schema, model, Types } from "mongoose";

const RolePermissionSchema = new Schema({
  tenantId: { type: String, required: true, index: true },
  role_id: { type: Types.ObjectId, ref: "Role", required: true },
  permission_id: { type: Types.ObjectId, ref: "Permission", required: true },
});

RolePermissionSchema.index(
  { tenantId: 1, role_id: 1, permission_id: 1 },
  { unique: true }
);

export const RolePermission = model(
  "RolePermission",
  RolePermissionSchema
);
