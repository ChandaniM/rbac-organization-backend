import { Types } from "mongoose";
import { UserRole } from "../models/user-role.model";

export const assignRoleToUser = async (data: {
  tenantId: string;
  user_id: Types.ObjectId;
  role_id: Types.ObjectId;
}) => {
  return await UserRole.create(data);
};

export const getUserRoles = async (
  tenantId: string,
  userId: Types.ObjectId
) => {
  return await UserRole.find({
    tenantId,
    user_id: userId,
  }).populate("role_id");
};

export const removeRoleFromUser = async (
  tenantId: string,
  userId: Types.ObjectId,
  roleId: Types.ObjectId
) => {
  return await UserRole.findOneAndDelete({
    tenantId,
    user_id: userId,
    role_id: roleId,
  });
};
