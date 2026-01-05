"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
// src/config/mongo.ts
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
        console.log("DB:", mongoose_1.default.connection.name);
    }
    catch (error) {
        console.error("❌ MongoDB connection failed", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
