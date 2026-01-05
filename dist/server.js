"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config/config"));
const mongo_1 = require("./config/mongo"); // ✅ NOTE THE { }
const startServer = async () => {
    await (0, mongo_1.connectDB)(); // DB connection
    app_1.default.listen(config_1.default.port, () => {
        console.log(`🚀 Server running on port ${config_1.default.port}`);
    });
};
startServer();
