import { Request, Response } from "express";
import * as auditLogService from "../services/audit-log.service";

// Get audit logs with filters
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const user = req.user as any;
    
    if (!user || !user.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User information not found"
      });
    }

    const userId = user.userId;
    // Extract role name from roles array or default to 'Employee'
    const userRole = user.roles?.[0]?.name || user.roles?.name || 'Employee';

    console.log('Audit Log Request:', {
      tenantId,
      userId,
      userRole,
      hasUser: !!user,
      userKeys: Object.keys(user),
      roles: user.roles
    });

    const options = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 50,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      userId: req.query.userId as string,
      action: req.query.action as string,
      entity: req.query.entity as string,
      userRole: req.query.userRole as string,
      search: req.query.search as string,
      sortBy: req.query.sortBy as string || 'timestamp',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
    };

    const result = await auditLogService.getAuditLogs(
      tenantId,
      userId,
      userRole,
      options
    );

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (err: any) {
    console.error("Error fetching audit logs:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
      error: err.message
    });
  }
};

// Get audit log by ID
export const getAuditLogById = async (req: Request, res: Response) => {
  try {
    const { tenantId, logId } = req.params;
    const user = req.user as any;
    
    if (!user || !user.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User information not found"
      });
    }

    const userId = user.userId;
    const userRole = user.roles?.[0]?.name || user.roles?.name || 'Employee';

    const log = await auditLogService.getAuditLogById(
      tenantId,
      logId,
      userId,
      userRole
    );

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Audit log not found or access denied"
      });
    }

    res.status(200).json({
      success: true,
      data: log
    });
  } catch (err: any) {
    console.error("Error fetching audit log:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit log",
      error: err.message
    });
  }
};

// Get audit log statistics
export const getAuditLogStats = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const user = req.user as any;
    
    if (!user || !user.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User information not found"
      });
    }

    const userId = user.userId;
    const userRole = user.roles?.[0]?.name || user.roles?.name || 'Employee';
    const period = (req.query.period as 'day' | 'week' | 'month') || 'week';

    const stats = await auditLogService.getAuditLogStats(
      tenantId,
      userId,
      userRole,
      period
    );

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err: any) {
    console.error("Error fetching audit log stats:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit log statistics",
      error: err.message
    });
  }
};

// Export audit logs
export const exportAuditLogs = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const user = req.user as any;
    
    if (!user || !user.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User information not found"
      });
    }

    const userId = user.userId;
    const userRole = user.roles?.[0]?.name || user.roles?.name || 'Employee';
    const format = (req.query.format as 'csv' | 'json') || 'csv';

    const options = {
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      userId: req.query.userId as string,
      action: req.query.action as string,
      entity: req.query.entity as string,
      userRole: req.query.userRole as string,
      search: req.query.search as string
    };

    const result = await auditLogService.exportAuditLogs(
      tenantId,
      userId,
      userRole,
      format,
      options
    );

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
      res.send(result);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.json"`);
      res.json(result);
    }
  } catch (err: any) {
    console.error("Error exporting audit logs:", err);
    res.status(500).json({
      success: false,
      message: "Failed to export audit logs",
      error: err.message
    });
  }
};

// Create audit log (usually called from middleware, but exposed for manual logging)
export const createAuditLog = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const logData = req.body;

    const log = await auditLogService.createAuditLog({
      tenantId,
      ...logData
    });

    res.status(201).json({
      success: true,
      data: log
    });
  } catch (err: any) {
    console.error("Error creating audit log:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create audit log",
      error: err.message
    });
  }
};