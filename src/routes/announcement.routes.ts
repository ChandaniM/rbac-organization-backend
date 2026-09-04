import { Router } from "express";

import { authenticate } from "../middlewares/jwt.middleware";
import { createAnnouncement, getAllAnnouncements } from "../controllers/announcement.controller";
import { rateLimitPresets } from '../middlewares/rate-limit.middleware';
import { debounceMiddleware } from '../utils/debounce.util';

const router = Router();

router.post(
  "/:tenantId/addAnnouncement",
  authenticate,
  rateLimitPresets.api,
  createAnnouncement
);

router.get(
  "/:tenantId/getAllAnnouncement",
  authenticate,
  rateLimitPresets.search,
  debounceMiddleware(300),
  getAllAnnouncements
);

export default router;
