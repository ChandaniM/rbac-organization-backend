"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrg = exports.createOrg = void 0;
const org_service_1 = require("../services/org.service");
const createOrg = async (req, res) => {
    try {
        const org = await (0, org_service_1.createOrgService)(req.body);
        return res.status(201).json({
            success: true,
            data: org,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create organization",
        });
    }
};
exports.createOrg = createOrg;
const updateOrg = async (req, res) => {
    try {
        const orgId = req.query.id;
        let data = { id: orgId, ...req.body };
        const org = await (0, org_service_1.updateOrgService)(data);
        return res.status(201).json({
            success: true,
            data: org,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create organization",
        });
    }
};
exports.updateOrg = updateOrg;
