import { CreateOrgDTO, UpdateOrgDTO } from "../interface/org.interface";
import { Organization } from "../models/organization.model";

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

export const updateOrg = async (id:string , data:any) => {
  const updatedOrg = await Organization.findByIdAndUpdate(
   id,
    {
      $set: data
    },
    { new: true }
  );


  return updatedOrg;
};
