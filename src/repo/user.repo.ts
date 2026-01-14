import { User } from '../models/user.model';
import { Types } from "mongoose";

export const findUserByEmail = async (email: string) => {
  const existingUser = await User.findOne({ email });
  return existingUser;
};

export const createUser = async (data: {
    org_id: Types.ObjectId;
    email: string;
    username: string;
    password_hash: string;
  }) => {
    let user = new User({
        org_id: data.org_id,
        email: data.email,
        username: data.username,
        password_hash: data.password_hash,
        is_active: true,
        email_verified: false,
    })
    return await user.save();
  };
