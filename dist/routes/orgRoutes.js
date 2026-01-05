"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organzation_controller_1 = require("../controllers/organzation.controller");
const router = (0, express_1.Router)();
router.post("/org", organzation_controller_1.createOrg);
router.put("/update", organzation_controller_1.updateOrg);
exports.default = router;
