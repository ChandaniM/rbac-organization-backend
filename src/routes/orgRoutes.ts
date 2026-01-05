import { Router } from "express";
import { createOrg, updateOrg } from "../controllers/organzation.controller";

const router = Router();

router.post("/org", createOrg);

router.put("/update" , updateOrg);

export default router;
