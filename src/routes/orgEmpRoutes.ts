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
import * as userCtrl from "../controllers/orgEmployee.controller";
import { authenticate, requireOrgAdminForTenantParam } from "../middlewares/jwt.middleware";
import * as orgHierarchyCtrl from "../controllers/orgHierarchy.controller";

const router = Router();

router.post(
  "/:tenantId/users",
  authenticate,
  requireOrgAdminForTenantParam("tenantId"),
  userCtrl.createUser
);
router.get(
  "/:tenantId/users",
  authenticate,
  requireOrgAdminForTenantParam("tenantId"),
  userCtrl.getAllUsers
);
router.get(
  "/:tenantId/users/:userId",
  authenticate,
  requireOrgAdminForTenantParam("tenantId"),
  userCtrl.getUserById
);
router.put(
  "/:tenantId/users/:userId",
  authenticate,
  requireOrgAdminForTenantParam("tenantId"),
  userCtrl.updateUser
);
router.delete(
  "/:tenantId/users/:userId",
  authenticate,
  requireOrgAdminForTenantParam("tenantId"),
  userCtrl.deleteUser
);

// Reporting manager hierarchy (employee -> manager)
router.post(
  "/:tenantId/hierarchy/assign",
  authenticate,
  requireOrgAdminForTenantParam("tenantId"),
  orgHierarchyCtrl.assignHierarchy
);

router.get(
  "/:tenantId/hierarchy/tree",
  authenticate,
  requireOrgAdminForTenantParam("tenantId"),
  orgHierarchyCtrl.getHierarchyTree
);

export default router;

