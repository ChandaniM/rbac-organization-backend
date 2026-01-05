import { CreateOrgDTO, UpdateOrgDTO } from '../interface/org.interface';
import * as repo from '../repo/org.repo';

export const createOrgService = async (data: CreateOrgDTO) => {
  return await repo.createOrg(data);
};

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
