import { Request, Response } from "express";
import * as orgHierarchyService from "../services/orgHierarchy.service";

// POST /api/:tenantId/hierarchy/assign
export const assignHierarchy = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params as { tenantId: string };
    const { userId, managerId } = req.body as {
      userId?: string;
      managerId?: string;
    };

    if (!tenantId) {
      return res.status(400).json({ message: "tenantId is required" });
    }
    if (!userId || !managerId) {
      return res.status(400).json({ message: "userId and managerId are required" });
    }

    const result = await orgHierarchyService.assignHierarchy(tenantId, userId, managerId);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message || "Failed to assign hierarchy" });
  }
};

// GET /api/:tenantId/hierarchy/tree
export const getHierarchyTree = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params as { tenantId: string };
    if (!tenantId) {
      return res.status(400).json({ message: "tenantId is required" });
    }

    const result = await orgHierarchyService.getHierarchyTree(tenantId);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to fetch hierarchy" });
  }
};

