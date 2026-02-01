import { Permission } from "../models/permission.model";

export const createPermission = async (data: {
  name: string;
  description?: string;
}) => {
  return await Permission.create(data);
};

export const getPermissionByName = async (name: string) => {
  return await Permission.findOne({ name });
};

export const getAllPermissions = async () => {
  return await Permission.find();
};

export const deletePermission = async (id: string) => {
  return await Permission.findByIdAndDelete(id);
};


export const getPermissionsByNames = async (names: string[]) => {
    return await Permission.find({
      name: { $in: names },
    });
  };