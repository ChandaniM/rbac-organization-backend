import { Schema, model, Types } from "mongoose";

const RolePermissionSchema = new Schema({
  role_id: { type: Types.ObjectId, ref: "Role", required: true },
  permission_id: { type: Types.ObjectId, ref: "Permission", required: true },
});

RolePermissionSchema.index(
  { role_id: 1, permission_id: 1 },
  { unique: true }
);

export const RolePermission = model(
  "RolePermission",
  RolePermissionSchema
);
