import { Router } from "express";
import * as auditLogCtrl from "../controllers/audit-log.controller";
import { authenticate } from "../middlewares/jwt.middleware";
import { rateLimitPresets } from '../middlewares/rate-limit.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

router.use(authenticate);

router.get(
  "/:tenantId/audit-logs",
  rateLimitPresets.expensive,
  cacheMiddleware({ ttl: 60, prefix: 'audit-logs' }),
  auditLogCtrl.getAuditLogs
);

router.get(
  "/:tenantId/audit-logs/stats",
  rateLimitPresets.expensive,
  cacheMiddleware({ ttl: 300, prefix: 'audit-stats' }),
  auditLogCtrl.getAuditLogStats
);

router.get(
  "/:tenantId/audit-logs/export",
  rateLimitPresets.expensive,
  auditLogCtrl.exportAuditLogs
);

router.get(
  "/:tenantId/audit-logs/:logId",
  rateLimitPresets.api,
  auditLogCtrl.getAuditLogById
);

router.post(
  "/:tenantId/audit-logs",
  rateLimitPresets.api,
  auditLogCtrl.createAuditLog
);

export default router;