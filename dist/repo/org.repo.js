"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrg = exports.createOrg = void 0;
const org_model_1 = require("../models/org.model");
const createOrg = async (data) => {
    const org = new org_model_1.OrgModel({
        name: data.name,
        display_name: data.display_name,
        description: data.description,
        status: data.status,
        parent_id: data.parent_id || null,
        created_by: data.created_by,
    });
    return await org.save();
};
exports.createOrg = createOrg;
const updateOrg = async (id, data) => {
    const updatedOrg = await org_model_1.OrgModel.findByIdAndUpdate(id, {
        $set: data
    }, { new: true });
    return updatedOrg;
};
exports.updateOrg = updateOrg;
