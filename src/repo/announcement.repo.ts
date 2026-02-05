import { AnnouncementModel as Announcement } from "../models/announcements.model";

// CREATE
export const create = async (data: any) => {
  let announcement = new Announcement({
    ...data,
  });
  return await announcement.save();
};

// GET ALL (with pagination)
export const findAll = async (
  page: number,
  limit: number,
  query: any
) => {
  const skip = (page - 1) * limit;

  const announcements = await Announcement.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  return announcements;
};

// DELETE BY TENANT
export const deleteByTenant = async (
  announcementId: string,
  tenantId: string
) => {
  return await Announcement.findOneAndDelete({
    _id: announcementId,
    tenantId,
  });
};
