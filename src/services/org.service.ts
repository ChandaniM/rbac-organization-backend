import { CreateOrgDTO, UpdateOrgDTO } from '../interface/org.interface';
import * as repo from '../repo/org.repo';
import { createUser, findUserByEmail } from '../repo/user.repo';
import bcrypt from 'bcrypt';

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

/**
 *  SUPAR ADMIN ROUTE WHICH USED TO CREATE org and its first admin
 * @param  data = { "org": {
  "name": "IDFY",
  "display_name": "IDFY Corp",
  "description":"IDFY is a software company.",
  "status": "active",
  "created_by": "super admin"
  },
  "user": {
    "email": "admin@idfy.com",
    "username": "idfy_admin",
    "password": "StrongPassword123"
  }
 * }
 * 
 * @returns respose {
    organization: {
      id: organization._id,
      name: organization.name,
    },
    user: {
      id: createdUser._id,
      email: createdUser.email,
      username: createdUser.username,
    },
  };
 */
export const createorganizationwithuserService = async (data: any) => {
  let { org, user } = data;
  const existingUser = await findUserByEmail(user.email);
  if (existingUser) {
    throw new Error('User already exists');
  }
  const organization = await repo.createOrg({
    name: org.name,
    display_name: org.display_name,
    description: org.description,
    status: 'active',
  });
  const password_hash = await bcrypt.hash(user.password, 10);
  const createdUser = await createUser({
    org_id: organization._id,
    email: user.email,
    username: user.username,
    password_hash,
  });
  return {
    organization: {
      id: organization._id,
      name: organization.name,
    },
    user: {
      id: createdUser._id,
      email: createdUser.email,
      username: createdUser.username,
    },
  };
};
