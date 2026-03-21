import { Router } from "express";
import * as auditLogCtrl from "../controllers/audit-log.controller";
import { authenticate } from "../middlewares/jwt.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get audit logs with filters and pagination
router.get("/:tenantId/audit-logs", auditLogCtrl.getAuditLogs);

// Get audit log statistics
router.get("/:tenantId/audit-logs/stats", auditLogCtrl.getAuditLogStats);

// Export audit logs
router.get("/:tenantId/audit-logs/export", auditLogCtrl.exportAuditLogs);

// Get single audit log by ID
router.get("/:tenantId/audit-logs/:logId", auditLogCtrl.getAuditLogById);

// Create audit log manually (for testing or manual logging)
router.post("/:tenantId/audit-logs", auditLogCtrl.createAuditLog);

export default router;