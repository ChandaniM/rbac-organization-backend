import { Router } from "express";
import { createOrg, createorganizationwithuser, updateOrg } from "../controllers/organzation.controller";
import { authenticate } from "../middlewares/jwt.middleware";

const router = Router();

router.post("/org", createOrg);

router.put("/update" , updateOrg);

router.post("/organizationwithuser" , authenticate, createorganizationwithuser)

export default router;
