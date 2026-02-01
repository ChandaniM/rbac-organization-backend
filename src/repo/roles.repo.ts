import { Role } from '../models/role.model'; 
import { Types } from 'mongoose';

interface IRoleInput {
    tenantId: string;
    name: string;
    description?: string;
  }
  
export const findRoleByTenantid = (tenantId:string) =>{
    let rolesObject =  Role.findOne({tenantId: tenantId});
    return rolesObject;
}

export const addRoles = async (data: IRoleInput) => {
    const role = await Role.create(data);
    return role;
  };

  export const createRole = async (data: {
    tenantId: string;
    name: string;
    description?: string;
  }) => {
    return await Role.create(data);
  };
  
  export const getRoleByName = async (
    tenantId: string,
    name: string
  ) => {
    return await Role.findOne({ tenantId, name });
  };
  
  export const getRolesByTenant = async (tenantId: string) => {
    return await Role.find({ tenantId });
  };
  