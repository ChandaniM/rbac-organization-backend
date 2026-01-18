// import { User } from "../models/user.model";
// import { UserHierarchy } from "../models/user-hierarchy.model";
// import { Types } from "mongoose";

// export const userRepo = {
//   // CREATE USER
//   create: async (tenantId: string, data: any) => {
//     const { managerId } = data;

//     // Verify manager belongs to same tenant
//     if (managerId) {
//       const manager = await User.findOne({ _id: managerId, tenantId });
//       if (!manager) throw new Error("Manager not found in this tenant");
//     }

//     const user = await User.create({ tenantId, ...data });

//     // Add hierarchy entry if manager exists
//     if (managerId) {
//       await UserHierarchy.create({
//         tenantId,
//         userId: user._id,
//         managerId,
//       });
//     }

//     return user;
//   },

//   // GET ALL USERS (with pagination & search)
//   findAll: async (
//     tenantId: string,
//     page: number = 1,
//     limit: number = 10,
//     search?: string
//   ) => {
//     const query: any = { tenantId };

//     if (search && search.trim() !== "") {
//       query.$or = [
//         { username: { $regex: search, $options: "i" } },
//         { email: { $regex: search, $options: "i" } },
//       ];
//     }

//     const skip = (page - 1) * limit;

//     const [users, total] = await Promise.all([
//       User.find(query).skip(skip).limit(limit).sort({ created_at: -1 }),
//       User.countDocuments(query),
//     ]);

//     return {
//       data: users,
//       pagination: {
//         totalRecords: total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   },

//   // GET USER BY ID
//   findById: async (tenantId: string, userId: string) => {
//     return await User.findOne({ _id: userId, tenantId });
//   },

//   // UPDATE USER
//   update: async (tenantId: string, userId: string, data: any) => {
//     delete data.tenantId; // prevent tenant change
//     const { managerId } = data;

//     // Update hierarchy if manager changed
//     if (managerId) {
//       const manager = await User.findOne({ _id: managerId, tenantId });
//       if (!manager) throw new Error("Manager not found in this tenant");

//       await UserHierarchy.findOneAndUpdate(
//         { tenantId, userId },
//         { managerId },
//         { upsert: true, new: true }
//       );
//     }

//     const updated = await User.findOneAndUpdate(
//       { _id: userId, tenantId },
//       { $set: data },
//       { new: true }
//     );

//     if (!updated) throw new Error("User not found");
//     return updated;
//   },

//   // DELETE USER
//   delete: async (tenantId: string, userId: string) => {
//     await UserHierarchy.deleteOne({ tenantId, userId });
//     const deleted = await User.findOneAndDelete({ _id: userId, tenantId });
//     if (!deleted) throw new Error("User not found");
//     return deleted;
//   },

//   // GET SUBORDINATES
//   getSubordinates: async (tenantId: string, managerId: string) => {
//     const subs = await UserHierarchy.find({ tenantId, managerId }).populate("userId");
//     return subs.map((h) => h.userId);
//   },
// };



import { User } from '../models/user.model';
import { UserRole } from '../models/user-role.model';
import { UserHierarchy } from '../models/user-hierarchy.model';
import { ClientSession } from 'mongoose';

export const orgEmpRepo = {
  createUser: async (userData: any, session: ClientSession) => {
    return await User.create([userData], { session });
  },

  assignRoles: async (userId: string, roleIds: string[], session: ClientSession) => {
    const roles = roleIds.map(roleId => ({ user_id: userId, role_id: roleId }));
    return await UserRole.insertMany(roles, { session });
  },

  setHierarchy: async (tenantId: string, userId: string, managerId: string, session: ClientSession) => {
    return await UserHierarchy.create([{ tenantId, userId, managerId }], { session });
  },

  findUserByEmail: async (tenantId: string, email: string) => {
    return await User.findOne({ tenantId, email });
  }
};