import { Request, Response } from "express";
import { createOrgEmpService } from '../services/orgEmployee.service';

export const createOrgEmp = async (req: Request, res: Response) =>{
  try {
    const { tenantId } = req.params;
    const user = await createOrgEmpService(tenantId, req.body);
    res.status(201).json(user);

  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}


// // CREATE USER
// export const createUserCtrl = async (req: Request, res: Response) => {
//   try {
//     const { tenantId } = req.params;
//     const user = await service.createUser(tenantId, req.body);
//     res.status(201).json(user);
//   } catch (err: any) {
//     res.status(400).json({ message: err.message });
//   }
// };

// // GET ALL USERS (with pagination & search)
// export const getUsersCtrl = async (req: Request, res: Response) => {
//   try {
//     const { tenantId } = req.params;
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const search = req.query.search as string;

//     const users = await service.getUsers(tenantId, page, limit, search);
//     res.status(200).json(users);
//   } catch (err: any) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // GET USER BY ID
// export const getUserByIdCtrl = async (req: Request, res: Response) => {
//   try {
//     const { tenantId, userId } = req.params;
//     const user = await service.getUserById(tenantId, userId);
//     res.status(200).json(user);
//   } catch (err: any) {
//     res.status(404).json({ message: err.message });
//   }
// };

// // UPDATE USER
// export const updateUserCtrl = async (req: Request, res: Response) => {
//   try {
//     const { tenantId, userId } = req.params;
//     const updated = await service.updateUser(tenantId, userId, req.body);
//     res.status(200).json(updated);
//   } catch (err: any) {
//     res.status(400).json({ message: err.message });
//   }
// };

// // DELETE USER
// export const deleteUserCtrl = async (req: Request, res: Response) => {
//   try {
//     const { tenantId, userId } = req.params;
//     const deleted = await service.deleteUser(tenantId, userId);
//     res.status(200).json(deleted);
//   } catch (err: any) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // GET SUBORDINATES
// export const getSubordinatesCtrl = async (req: Request, res: Response) => {
//   try {
//     const { tenantId, managerId } = req.params;
//     const subs = await service.getSubordinates(tenantId, managerId);
//     res.status(200).json(subs);
//   } catch (err: any) {
//     res.status(500).json({ message: err.message });
//   }
// };
