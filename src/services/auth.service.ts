import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from '../repo/user.repo';
import { findOrgByTenantString } from '../repo/org.repo';
import { findRoleByTenantid } from '../repo/roles.repo';
export interface IOrganization {
  _id: string;
  name: string;
  display_name?: string;
  description?: string;
  status: string;
  parent_id?: string | null;
}

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

export const loginService = async (email: string, password: string) => {
  // 1. Find User
  const userData = await findUserByEmail(email);
  if (!userData) throw new Error('User not found');

  // 2. Validate Password
  const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
  if (!isPasswordValid) throw new Error('Invalid credentials');

  // 3. Find Organization
  const org = await findOrgByTenantString(userData.tenantId);
  if (!org) throw new Error('Organization not found');
  const rolesDetails = await findRoleByTenantid(userData.tenantId);
  console.log(rolesDetails , "roles and details .......")
  const payload = {
    userId: userData._id,
    tenantId: org._id,
    user: {
      id: userData._id,
      username: userData.username,
      email: userData.email,
    },
    org: {
      name: org.name,
      display_name: org.display_name,
      description: org.description,
      status: org.status,
    },
    roles : rolesDetails
  };

  // 5. Generate the Token
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  // 6. Return everything your frontend needs
  return {
    token, // The new JWT token
    tenantId: org._id,
    user: {
      id: userData._id,
      username: userData.username,
      email: userData.email,
    },
    org: {
      name: org.name,
      display_name: org.display_name,
      description: org.description,
      status: org.status,
    },
  };
};