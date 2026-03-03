import bcrypt from "bcryptjs";
import { User } from "../models/user.model";

// CREATE
export const createUser = async (
  tenantId: string,
  data: any
) => {
  const { username, email, password } = data;

  const exists = await User.findOne({ tenantId, email });
  if (exists) {
    throw new Error("User already exists for this tenant");
  }

  const password_hash = await bcrypt.hash(password, 10);

  return await User.create({
    tenantId,
    username,
    email,
    password_hash,
  });
};

// GET ALL
export const getAllUsers = async (
  tenantId: string,
  page: number,
  limit: number,
  search?: string
) => {
  const query: any = { tenantId };

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    User.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })
      .select("-password_hash"),
    User.countDocuments(query),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// GET BY ID
export const getUserById = async (
  tenantId: string,
  userId: string
) => {
  const user = await User.findOne({
    _id: userId,
    tenantId,
  }).select("-password_hash");

  if (!user) throw new Error("User not found");
  return user;
};

// UPDATE
export const updateUser = async (
  tenantId: string,
  userId: string,
  data: any
) => {
  if (data.password) {
    data.password_hash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }

  const user = await User.findOneAndUpdate(
    { _id: userId, tenantId },
    data,
    { new: true }
  ).select("-password_hash");

  if (!user) throw new Error("User not found");
  return user;
};

// DELETE
export const deleteUser = async (
  tenantId: string,
  userId: string
) => {
  const user = await User.findOneAndDelete({
    _id: userId,
    tenantId,
  });

  if (!user) throw new Error("User not found");
  return user;
};
