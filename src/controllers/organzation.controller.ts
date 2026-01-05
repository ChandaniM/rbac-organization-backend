import { Request, Response } from "express";
import { createOrgService, updateOrgService } from "../services/org.service";

export const createOrg = async (req: Request, res: Response) => {
  try {
    const org = await createOrgService(req.body);

    return res.status(201).json({
      success: true,
      data: org,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create organization",
    });
  }
};

export const updateOrg = async (req:Request , res : Response) =>{
  try {
    const orgId = req.query.id as string;
    let data = { id: orgId , ...req.body };
    const org = await updateOrgService(data);

    return res.status(201).json({
      success: true,
      data: org,
    });
  } catch (error :any) {
     return res.status(500).json({
      success: false,
      message: error.message || "Failed to create organization",
    });
  }
}
