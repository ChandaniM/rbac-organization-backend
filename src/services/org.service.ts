import mongoose, { Types } from 'mongoose';
import { createOrg } from '../repo/org.repo';
import { createUser, findUserByEmail, getOrgAdminsByTenantIds } from '../repo/user.repo';
import bcrypt from 'bcrypt';
import * as repo from '../repo/org.repo';
import { CreateOrgDTO } from '../interface/org.interface';
import { addRoles, findRoleByTenantid, getRoleByName, getRolesByTenant } from '../repo/roles.repo';
import { Permission } from '../models/permission.model';
import { getPermissionsByNames } from '../repo/permission.repo';
import { assignPermissionToRole, attachPermissionsToRole } from '../repo/role-permission.repo';
import { assignRoleToUser } from '../repo/user-role.repo';
import { Organization } from '../models/organization.model';
import { User } from '../models/user.model';
import { UserRole } from '../models/user-role.model';
import { UserHierarchy } from '../models/user-hierarchy.model';
import { UserInvitation } from '../models/user-invitation.model';
import { Role } from '../models/role.model';
import { RolePermission } from '../models/role-permission.model';
import { default as JobModel } from '../models/job.modal';
import { AnnouncementModel } from '../models/announcements.model';
import Notification from '../models/notification.model';
import { Dashboard } from '../models/dashboard.model';

export const createOrgService = async (data: CreateOrgDTO) => {
  return await repo.createOrg(data);
}


const ORG_UPDATABLE_FIELDS = [
  "name",
  "display_name",
  "description",
  "status",
  "parent_id",
  "created_by",
  "updated_by",
  "branding",
  "policies",
  "is_deleted",
];

export const updateOrgService = async (orgId: string, data: Record<string, unknown>) => {
  const payload: Record<string, unknown> = {};
  for (const key of ORG_UPDATABLE_FIELDS) {
    if (data[key] !== undefined) {
      payload[key] = data[key];
    }
  }
  if (Object.keys(payload).length === 0) {
    throw new Error("No valid fields to update");
  }
  return await repo.updateOrg(orgId, payload);
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
        description: org.description,
        status: org.status,
        createdAt: org.createdAt,
        created_by: org.created_by,
        username: adminUser ? adminUser.username : null,
        role: roleMap.get(org._id.toString()) || null,
      };
    });
    
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Delete organization and all related data across all tenant-scoped tables.
 * Tables cleared by tenantId: User, UserRole, UserHierarchy, UserInvitation, Role,
 * RolePermission, Job, Announcement, Notification, Dashboard.
 * Organization deleted by _id.
 */
export const deleteOrganizationCascade = async (orgId: string) => {
  if (!Types.ObjectId.isValid(orgId)) {
    throw new Error('Invalid organization ID');
  }

  const tenantIdStr = orgId;

  const org = await Organization.findById(orgId);
  if (!org) {
    throw new Error('Organization not found');
  }
  if (org.name === 'SYSTEM_ADMIN' || orgId === '000000000000000000000001') {
    throw new Error('Cannot delete system organization');
  }

  const tenantIdObj = new Types.ObjectId(orgId);

  await UserHierarchy.deleteMany({ tenantId: tenantIdStr });
  await UserRole.deleteMany({ tenantId: tenantIdStr });
  await RolePermission.deleteMany({ tenantId: tenantIdStr });
  await Notification.deleteMany({ tenantId: tenantIdObj });
  await Dashboard.deleteMany({ tenantId: tenantIdObj });
  await UserInvitation.deleteMany({ tenantId: tenantIdStr });
  await User.deleteMany({ tenantId: tenantIdStr });
  await JobModel.deleteMany({ tenantId: tenantIdStr });
  await AnnouncementModel.deleteMany({ tenantId: tenantIdStr });
  await Role.deleteMany({ tenantId: tenantIdStr });
  await Organization.findByIdAndDelete(orgId);

  return { deleted: true, orgId };
};
