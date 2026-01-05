"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orgRoutes_1 = __importDefault(require("./routes/orgRoutes"));
// import { errorHandler } from './middlewares/errorHandler';
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Default help route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the API! Use /items or other endpoints to interact with the API.",
        availableRoutes: {
            items: "/items",
            // add more routes here
        }
    });
});
// Routes
app.use('/api/', orgRoutes_1.default);
// Global error handler (should be after routes)
// app.use(errorHandler);
exports.default = app;
