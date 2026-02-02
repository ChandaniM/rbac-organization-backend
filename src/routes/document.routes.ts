// routes/document.routes.ts
import { Router } from "express";
import multer from "multer";
import * as DocumentController from "../controllers/document.controller";
import { authenticate } from "../middlewares/jwt.middleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.delete("/delete", authenticate, DocumentController.deleteDocument);
// POST /api/documents/upload
router.post("/upload", authenticate , upload.single("file"), DocumentController.uploadDocument);

// GET /api/documents
router.get("/", authenticate, DocumentController.listDocuments);

router.get("/download",authenticate, DocumentController.downloadDocument);

export default router;