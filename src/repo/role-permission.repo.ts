import { Types } from "mongoose";
import { RolePermission } from "../models/role-permission.model";
export const attachPermissionsToRole = async (
  data: {
    tenantId: string | null;
    role_id: Types.ObjectId;
    permission_ids: Types.ObjectId[];
  }
) => {
  await RolePermission.insertMany(
    data.permission_ids.map(pid => ({
      tenantId: data.tenantId,
      role_id: data.role_id,
      permission_id: pid,
    })),
    { ordered: false }
  );

  return {
    role_id: data.role_id,
    attached_permission_ids: data.permission_ids,
  };
};

// export const attachPermissionsToRole = async (
//   data: {
//     tenantId: string | null;
//     role_id: Types.ObjectId;
//     permission_ids: Types.ObjectId[];
//   }
// ) => {
//   const docs = data.permission_ids.map((pid) => ({
//     tenantId: data.tenantId,
//     role_id: data.role_id,
//     permission_id: pid,
//   }));

//   return await RolePermission.insertMany(docs, {
//     ordered: false,
//   });
// };
export const getPermissionsByRole = async (
  tenantId: string,
  roleId: Types.ObjectId
) => {
  return await RolePermission.find({
    tenantId,
    role_id: roleId,
  }).populate("permission_id");
};

export const removePermissionFromRole = async (
  tenantId: string,
  roleId: Types.ObjectId,
  permissionId: Types.ObjectId
) => {
  return await RolePermission.findOneAndDelete({
    tenantId,
    role_id: roleId,
    permission_id: permissionId,
  });
};

export const rolePermissionToManay = () =>{
  
}

export const assignPermissionToRole = async (
  data: {
    tenantId: string;
    role_id: Types.ObjectId;
    permission_id: Types.ObjectId;
  }
) => {
  return await RolePermission.create({
    tenantId: data.tenantId,
    role_id: data.role_id,
    permission_id: data.permission_id,
  });
};