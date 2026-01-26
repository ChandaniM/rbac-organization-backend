import { Role } from "../models/role.model"
export const findRoleByTenantid = (tenantId:string) =>{
    let rolesObject =  Role.findOne({tenantId: tenantId});
    console.log(rolesObject, 'repocall');
    
    return rolesObject;
}