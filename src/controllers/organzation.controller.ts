import { Request, Response } from "express";
import { createorganizationwithuserService, createOrgService, updateOrgService, getAllOrgData, deleteOrganizationCascade } from "../services/org.service";

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

export const updateOrg = async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    const org = await updateOrgService(orgId, req.body);

    return res.status(200).json({
      success: true,
      data: org,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update organization",
    });
  }
};

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

export const deleteOrganization = async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    await deleteOrganizationCascade(orgId);

    return res.status(200).json({
      success: true,
      message: "Organization and all related data deleted",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete organization",
    });
  }
};
