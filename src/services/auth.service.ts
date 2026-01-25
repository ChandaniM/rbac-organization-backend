// import { createUser, findUserByEmail } from "../repo/user.repo";
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/user');

// export const registerFun = async (data:{email:string,password:string,username:string})=>{
//     console.log("data - resg " , data.email , data.password , data.username);
//     // let {email , password , username } = data;
//     // let existingUser = await findUserByEmail(email);

//     // if (existingUser) {
//     //     return { message: "User already exists" };
//     // }
//     // const hashedPassword = await bcrypt.hash(password, 10);
//     // let editResponse = {
//     //     username,
//     //     email,
//     //     password:hashedPassword
//     // }
// //    let userResult = await  createUser(editResponse)
// //    if(userResult){
// //     return {
// //         message:"user created successfully"
// //     }else{
// //         return {
// //              message:"Something wet wrong "
// //         }
//     // }
// //    }
// }

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from '../repo/user.repo';
import { findOrgByTenantString } from '../repo/org.repo';
export interface IOrganization {
  _id: string;
  name: string;
  display_name?: string;
  description?: string;
  status: string;
  parent_id?: string | null;
}

// export const loginService = async (email: string, password: string) => {
//   console.log(email, 'email');
//   let userData = await findUserByEmail(email);
//   console.log(userData, 'USER DETAILS ');
//   if (!userData) {
//     throw new Error('User not found');
//   }

// //   if (userData.is_active !== true) throw new Error("User is inactive");

//   const isPasswordValid = await bcrypt.compare(
//     password,
//     userData.password_hash,
//   );
//   if (!isPasswordValid) {
//     throw new Error('Invalid credentials');
//   }

//   const org = await findOrgByTenantString(userData.tenantId);
//   console.log(org, 'THIS IS ORG DATA ');
//   if (!org) {
//     throw new Error('Organization not found');
//   }

//   return {
//     tenantId: org._id, // THIS is tenantId
//     user: {
//       id: userData._id,
//       username: userData.username,
//       email: userData.email,
//     },
//     org: {
//       name: org.name,
//       display_name: org.display_name,
//       description: org.description,
//       status: org.status,
//       parent_id: org.parent_id,
//     },
//   };
// };


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