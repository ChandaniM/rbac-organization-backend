import { Router } from "express";

import { authenticate } from "../middlewares/jwt.middleware";
import { createAnnouncement, getAllAnnouncements } from "../controllers/announcement.controller";

const router = Router();

router.post("/:tenantId/addAnnouncement", authenticate, createAnnouncement);
router.get("/:tenantId/getAllAnnouncement", authenticate, getAllAnnouncements);

export default router;
