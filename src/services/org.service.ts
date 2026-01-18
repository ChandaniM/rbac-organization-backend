import mongoose from 'mongoose';
import { createOrg } from '../repo/org.repo';
import { createUser, findUserByEmail } from '../repo/user.repo';
import bcrypt from 'bcrypt';
import * as repo from '../repo/org.repo';
import { CreateOrgDTO } from '../interface/org.interface';
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
      tenantId: tenantIdString, // Yahan strictly string convert kiya
      email: user.email,
      username: user.username,
      password_hash,
      is_active: true
    });

    // Sab sahi raha toh save karein
    await session.commitTransaction();

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

  } catch (error: any) {
    // Error aane par purana data rollback kar dein
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};