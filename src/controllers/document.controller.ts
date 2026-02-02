// controllers/document.controller.ts
import { Readable } from "stream";
import * as StorageService from "../services/storage.service";
import { Request, Response } from "express";

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { tenantId, role } = req.body;
    const file = req.file;

    if (!file || !tenantId || !role) {
      return res.status(400).json({ error: "Missing required upload metadata" });
    }

    const result = await StorageService.uploadToTenantStorage(file, tenantId, role);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listDocuments = async (req: Request, res: Response) => {
  try {
    const { tenantId, role } = req.query;
    const files = await StorageService.getTenantFiles(tenantId as string, role as string);
    res.json(files);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// NEW: Download Controller
export const downloadDocument = async (req: Request, res: Response) => {
  try {
    const { tenantId, role, key } = req.query;
    const { body, contentType } = await StorageService.getFileStream(
      tenantId as string,
      role as string,
      key as string
    );

    const fileName = (key as string).split("/").pop();
    res.setHeader("Content-Type", contentType || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Stream directly to response
    (body as Readable).pipe(res);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
};

// NEW: Delete Controller
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { tenantId, role, key } = req.query;
    console.log(tenantId , role , key);
    
    await StorageService.deleteTenantFile(
      tenantId as string,
      role as string,
      key as string
    );
    res.json({ message: "Document deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
