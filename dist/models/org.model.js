"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgModel = void 0;
const mongoose_1 = require("mongoose");
const orgSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    display_name: { type: String },
    description: { type: String },
    status: { type: String },
    parent_id: { type: mongoose_1.Types.ObjectId, ref: "organization", default: null },
    created_by: { type: Number },
    updated_by: { type: Number },
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
});
exports.OrgModel = (0, mongoose_1.model)("organization", orgSchema);
