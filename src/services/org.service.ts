import mongoose from 'mongoose';
import { createOrg } from '../repo/org.repo';
import { createUser, findUserByEmail ,  getOrgAdminsByTenantIds} from '../repo/user.repo';
import bcrypt from 'bcrypt';
import * as repo from '../repo/org.repo';
import { CreateOrgDTO } from '../interface/org.interface';
import { addRoles, findRoleByTenantid, getRoleByName, getRolesByTenant } from '../repo/roles.repo';
import { Permission } from '../models/permission.model';
import { getPermissionsByNames } from '../repo/permission.repo';
import { assignPermissionToRole, attachPermissionsToRole } from '../repo/role-permission.repo';
import { assignRoleToUser } from '../repo/user-role.repo';

export const createOrgService = async (data: CreateOrgDTO) => {
  return await repo.createOrg(data);
}


export const updateOrgService = async (data: any) => {
  let result = data;
  let keys = Object.keys(data);
  let newObj: { [key: string]: unknown } = {};
  for (let i = 1; i < keys.length; i++) {
    const element = keys[i];
    newObj[element] = result[element];
  }
  return await repo.updateOrg(data.id, newObj);
};

export const createorganizationwithuserService = async (data: any) => {
  const { org, user } = data;

  // 1. Transaction Start karein (Best Practice)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 2. Email check (Duplicate user check)
    const existingUser = await findUserByEmail(user.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // 3. Create Organization
    const organization = await createOrg({
      name: org.name,
      display_name: org.display_name,
      description: org.description,
      status: org.status || 'active',
      // Agar created_by user ID hai toh wo bhi bhej sakte hain
    });

    // 4. Hash Password
    const password_hash = await bcrypt.hash(user.password, 10);

    const tenantIdString = organization._id.toString(); 
    console.log(typeof tenantIdString); 

    // 5. Create User (Linking with Org ID as String)
    const createdUser = await createUser({
      tenantId: tenantIdString,
      email: user.email,
      username: user.username,
      password_hash,
      is_active: true,
      // is_org_admin :true,
    });

  const orgAdminRole = await addRoles(
          { 
            tenantId: tenantIdString,
            name: "org_admin",
            description: "Organization Administrator",
          },
        );

  console.log(orgAdminRole , "roles created for that user : yeeee");

  const permissions = await getPermissionsByNames([
    "add_users",
    "assign_roles",
    "view_team",
    "edit_team",
    "view_profile",
  ]);
  await attachPermissionsToRole(
    {
      tenantId:tenantIdString,
      role_id: orgAdminRole._id,
      permission_ids: permissions.map(p => p._id),
    },
  );

  await assignRoleToUser(
    {
      tenantId:tenantIdString,
      user_id: createdUser._id,
      role_id: orgAdminRole._id,
    }
  );


    await session.commitTransaction();

    return {
      tenant: orgAdminRole.tenantId,
      organization: {
        id: organization._id,
        name: organization.name,
        status: organization.status
      },
      user: {
        id: createdUser._id,
        email: createdUser.email,
        username: createdUser.username,
      },
      roles : {
        "tenantId": orgAdminRole.tenantId,
        "name": orgAdminRole.name,
        "description": orgAdminRole.description,
        "role_id":  orgAdminRole._id
      }
    };

  } catch (error: any) {
    // Error aane par purana data rollback kar dein
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getAllOrgData = async () => {
  try {
    const organizations = await repo.getAllOrgDataRepo();

    if (!organizations.length) return [];

    const filteredOrgs = organizations.filter(
      (org: any) => org.name !== "SYSTEM_ADMIN"
    );

    const tenantIds = filteredOrgs.map((org: any) =>
      org._id.toString()
    );
    console.log("tenantIds -> ", tenantIds);
  
    const users = await getOrgAdminsByTenantIds(tenantIds);
    const roleMap = new Map<string, string>();

    for (const element of tenantIds) {
      const role = await getRoleByName(element, "org_admin");
      if (role) {
        roleMap.set(element, role.name); // "org_admin"
      }
    }
    
    console.log(users, "users ->");
    
    return filteredOrgs.map((org: any) => {
      const adminUser = users.find(
        (u: any) => u.tenantId === org._id.toString()
      );
    
      return {
        id: org._id,
        name: org.name,
        display_name: org.display_name,
        status: org.status,
        createdAt: org.createdAt,
        username: adminUser ? adminUser.username : null,
        role: roleMap.get(org._id.toString()) || null,
      };
    });
    
  } catch (error) {
    console.error(error);
    throw error;
  }
};
