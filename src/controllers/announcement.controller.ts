import { Request, Response } from "express";
import {
  createAnnouncementService,
  getAllAnnouncementsService,
} from "../services/announcement.service";

export const createAnnouncement = async (
  req: Request,
  res: Response
) => {
  try {
    const { tenantId, userId } = req.params as { tenantId: string; userId: string };
    const { title, description, priority } = req.body;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: "tenantId is missing",
      });
    }

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "title and description are required",
      });
    }

    const announcement = await createAnnouncementService({
      tenantId,
      title,
      description,
      priority,
      createdBy: userId,
    });

    return res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create announcement",
    });
  }
};

export const getAllAnnouncements = async (
  req: Request,
  res: Response
) => {
  try {
    const { tenantId } = req.params as { tenantId: string; userId: string };
    const { page = "1", limit = "10", search = "" } = req.query;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: "tenantId is missing",
      });
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const announcements = await getAllAnnouncementsService(
      tenantId,
      pageNumber,
      limitNumber,
      search as string
    );

    return res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch announcements",
    });
  }
};
