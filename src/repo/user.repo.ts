import { Types } from "mongoose";
import { User, IUser } from '../models/user.model';

export const findUserByEmail = async (email: string) => {
  let userDetails = await User.findOne({ email }).lean<IUser>();
  console.log(userDetails , "get details by email")
  return userDetails;
};


export const createUser = async (data: {
    tenantId: string;
    email: string;
    username: string;
    password_hash: string;
    is_active:Boolean;
    // is_org_admin : Boolean;
  }) => {
    let user = new User({
        tenantId: data.tenantId,
        email: data.email,
        username: data.username,
        password_hash: data.password_hash,
        is_active: data.is_active,
        email_verified: false,
        // is_org_admin: data.is_org_admin,
    })
    return await user.save();
  };

  export const getOrgAdminsByTenantIds = async (tenantIds: string[]) => {
    return await User.find({
      tenantId: { $in: tenantIds },
      is_active: true,
    })
      .select("_id username email tenantId")
      .lean();
  };
  
  export const getUserById = async (id: string) => {
    return await User.findById(id);
  };