import { Request, Response } from "express";
import { createorganizationwithuserService, createOrgService, updateOrgService, getAllOrgData } from "../services/org.service";

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

export const createorganizationwithuser = async (req: Request, res: Response) => {
  try {
    const result = await createorganizationwithuserService(req.body);

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create organization",
    });
  }
};
export const getAllOrg = async (req: Request, res: Response) => {
  try {
    const data = await getAllOrgData();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch organizations",
    });
  }
};
