import { Router } from "express";
import { login } from "../controllers/auth.controller";
import { rateLimitPresets } from '../middlewares/rate-limit.middleware';

const router = Router();

router.post("/login", rateLimitPresets.auth, login);

export default router;
