import bcrypt from "bcryptjs";
import { User } from "../models/user.model";

// CREATE - maps all FE payload fields to DB
export const createUser = async (
  tenantId: string,
  data: any
) => {
  const { username, email, password } = data;

  if (!username || !email || !password) {
    throw new Error("Username, email and password are required");
  }

  const exists = await User.findOne({ tenantId, email });
  if (exists) {
    throw new Error("User already exists for this tenant");
  }

  const password_hash = await bcrypt.hash(password, 10);

  return await User.create({
    tenantId,
    username: String(data.username ?? "").trim(),
    email: String(data.email ?? "").toLowerCase().trim(),
    password_hash,
    is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
    job_title: String(data.job_title ?? "").trim(),
    department: String(data.department ?? "").trim(),
    location: String(data.location ?? "").trim(),
    phone: String(data.phone ?? "").trim(),
    business_unit: String(data.business_unit ?? "").trim(),
    avatar: String(data.avatar ?? "").trim(),
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
  const updatePayload: Record<string, unknown> = {};

  // Map all allowed FE fields to DB
  if (data.username !== undefined) updatePayload.username = String(data.username).trim();
  if (data.email !== undefined) updatePayload.email = String(data.email).toLowerCase().trim();
  if (data.is_active !== undefined) updatePayload.is_active = Boolean(data.is_active);
  if (data.job_title !== undefined) updatePayload.job_title = String(data.job_title).trim();
  if (data.department !== undefined) updatePayload.department = String(data.department).trim();
  if (data.location !== undefined) updatePayload.location = String(data.location).trim();
  if (data.phone !== undefined) updatePayload.phone = String(data.phone).trim();
  if (data.business_unit !== undefined) updatePayload.business_unit = String(data.business_unit).trim();
  if (data.avatar !== undefined) updatePayload.avatar = String(data.avatar).trim();

  // Hash password if provided
  if (data.password && String(data.password).trim() !== "") {
    updatePayload.password_hash = await bcrypt.hash(data.password, 10);
  }

  const user = await User.findOneAndUpdate(
    { _id: userId, tenantId },
    { $set: updatePayload },
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
