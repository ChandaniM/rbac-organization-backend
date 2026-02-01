import { Router } from "express";
import { createOrg, createorganizationwithuser, updateOrg , getAllOrg } from "../controllers/organzation.controller";
import { authenticate } from "../middlewares/jwt.middleware";

const router = Router();

router.post("/org", createOrg);

router.put("/update" , updateOrg);

router.post("/organizationwithuser" , authenticate, createorganizationwithuser)
router.get("/getAllOrg", authenticate , getAllOrg)
export default router;
