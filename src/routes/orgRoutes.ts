import { Router } from "express";
import { createOrg, createorganizationwithuser, updateOrg, getAllOrg, deleteOrganization } from "../controllers/organzation.controller";
import { authenticate, requireSystemAdmin } from "../middlewares/jwt.middleware";

const router = Router();

router.post("/org", createOrg);

router.put("/organization/:orgId", authenticate, requireSystemAdmin, updateOrg);

router.post("/organizationwithuser", authenticate, createorganizationwithuser);
router.get("/getAllOrg", authenticate, getAllOrg);
router.delete("/organization/:orgId", authenticate, requireSystemAdmin, deleteOrganization);

export default router;
