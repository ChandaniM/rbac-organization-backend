import { Router } from "express";
import { createOrg, createorganizationwithuser, updateOrg } from "../controllers/organzation.controller";

const router = Router();

router.post("/org", createOrg);

router.put("/update" , updateOrg);

router.post("/organizationwithuser" , createorganizationwithuser)

export default router;
