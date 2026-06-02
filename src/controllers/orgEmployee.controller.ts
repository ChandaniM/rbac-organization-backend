import { Request, Response } from "express";
import * as userService from "../services/orgEmployee.service";

// CREATE USER
export const createUser = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params as { tenantId: string };
    const user = await userService.createUser(tenantId, req.body);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// GET ALL USERS
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params as { tenantId: string };
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;

    const users = await userService.getAllUsers(
      tenantId,
      page,
      limit,
      search
    );

    res.status(200).json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// GET USER BY ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.params as { tenantId: string; userId: string };
    const user = await userService.getUserById(tenantId, userId);
    res.status(200).json(user);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

// UPDATE USER
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.params as { tenantId: string; userId: string };
    const user = await userService.updateUser(
      tenantId,
      userId,
      req.body
    );
    res.status(200).json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE USER
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.params as { tenantId: string; userId: string };
    const user = await userService.deleteUser(tenantId, userId);
    res.status(200).json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
