import * as repo from "../repo/announcement.repo";

// CREATE SERVICE
export const createAnnouncementService = async ({
    tenantId,
    title,
    description,
    priority,
    createdBy,
  }: {
    tenantId: string;
    title: string;
    description: string;
    priority: string;
    createdBy: string;
  }) => {
    const announcementPayload = {
      tenantId,
      title,
      description,
      priority,
      createdBy,
    };
  
    const createdAnnouncement =
      await repo.create(announcementPayload);
  
    return createdAnnouncement;
  };
  

// GET ALL SERVICE
export const getAllAnnouncementsService = async (
  tenantId: string,
  page: number,
  limit: number,
  search?: string
) => {
  let query: any = { tenantId };

  if (search && search.trim() !== "") {
    query.$text = { $search: search };
  }

  return await repo.findAll(page, limit, query);
};

// DELETE SERVICE
export const deleteAnnouncementService = async (
  tenantId: string,
  announcementId: string
) => {
  const result = await repo.deleteByTenant(
    announcementId,
    tenantId
  );

  if (!result) {
    throw new Error("Could not find announcement to delete");
  }

  return {
    message: `Announcement deleted successfully with id : ${announcementId}`,
  };
};
