import { Types } from 'mongoose';
import { CreateOrgDTO, UpdateOrgDTO } from '../interface/org.interface';
import { Organization } from '../models/organization.model';
import { User } from '../models/user.model';
export const createOrg = async (data: CreateOrgDTO) => {
  const org = new Organization({
    name: data.name,
    display_name: data.display_name,
    description: data.description,
    status: data.status,
    parent_id: data.parent_id || null,
    created_by: data.created_by,
  });

  return await org.save();
};

export const updateOrg = async (id: string, data: any) => {
  const updatedOrg = await Organization.findByIdAndUpdate(
    id,
    {
      $set: data,
    },
    { new: true },
  );

  return updatedOrg;
};

export const findOrgByTenantString = async (tenantId: string) => {
  if (tenantId === 'SYSTEM_GLOBAL_ORG') {
    return Organization.findById('SYSTEM_GLOBAL_ORG');
  }

  if (!Types.ObjectId.isValid(tenantId)) {
    throw new Error('Invalid tenantId format');
  }

  return Organization.findById(new Types.ObjectId(tenantId));
};
