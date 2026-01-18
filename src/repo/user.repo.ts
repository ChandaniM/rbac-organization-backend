import { User } from '../models/user.model';
import { Types } from "mongoose";
export interface IUser {
  _id: string;
  tenantId: string;
  username: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  email_verified: boolean;
}

export const findUserByEmail = async (email: string) => {
  let userDetails = User.findOne({ email }).lean<IUser>();
  console.log(userDetails , "get details by email")
  return userDetails;
};


export const createUser = async (data: {
    tenantId: string;
    email: string;
    username: string;
    password_hash: string;
    is_active:Boolean;
  }) => {
    let user = new User({
        tenantId: data.tenantId,
        email: data.email,
        username: data.username,
        password_hash: data.password_hash,
        is_active: data.is_active,
        email_verified: false,
    })
    return await user.save();
  };
