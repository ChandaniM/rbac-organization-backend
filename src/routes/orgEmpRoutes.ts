// import { Router } from "express";
// import {
//   createUserCtrl,
//   getUsersCtrl,
//   getUserByIdCtrl,
//   updateUserCtrl,
//   deleteUserCtrl,
//   getSubordinatesCtrl,
// } from "../controllers/orgEmployee.controller";

// const router = Router();

// // router.post("/:tenantId/emp", createUserCtrl);
// // router.get("/:tenantId/emp", getUsersCtrl); // pagination + search
// // router.get("/:tenantId/emp/:userId", getUserByIdCtrl);
// // router.put("/:tenantId/emp/:userId", updateUserCtrl);
// // router.delete("/:tenantId/emp/:userId", deleteUserCtrl);

// // Subordinates of a manager
// // router.get("/:tenantId/emp/:managerId/subordinates", getSubordinatesCtrl);

// export default router;


import { Router } from "express";
import { createOrgEmp } from "../controllers/orgEmployee.controller";
const router = Router();

router.post("/:tenantId/emp",createOrgEmp)


export default router;
