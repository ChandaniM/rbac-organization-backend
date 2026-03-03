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

const router = Router();

router.post("/:tenantId/users", userCtrl.createUser);
router.get("/:tenantId/users", userCtrl.getAllUsers);
router.get("/:tenantId/users/:userId", userCtrl.getUserById);
router.put("/:tenantId/users/:userId", userCtrl.updateUser);
router.delete("/:tenantId/users/:userId", userCtrl.deleteUser);

export default router;

