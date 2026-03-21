import { Request, Response, NextFunction } from "express";
import { createAuditLog } from "../services/audit-log.service";

// Map of routes to entity and action types
const routeMapping: Record<string, { entity: string; actionMap: Record<string, string> }> = {
  '/users': {
    entity: 'USER',
    actionMap: {
      'GET': 'VIEW',
      'POST': 'CREATE',
      'PUT': 'UPDATE',
      'PATCH': 'UPDATE',
      'DELETE': 'DELETE'
    }
  },
  '/organizations': {
    entity: 'ORGANIZATION',
    actionMap: {
      'GET': 'VIEW',
      'POST': 'CREATE',
      'PUT': 'UPDATE',
      'DELETE': 'DELETE'
    }
  },
  '/roles': {
    entity: 'ROLE',
    actionMap: {
      'GET': 'VIEW',
      'POST': 'CREATE',
      'PUT': 'UPDATE',
      'DELETE': 'DELETE'
    }
  },
  '/permissions': {
    entity: 'PERMISSION',
    actionMap: {
      'GET': 'VIEW',
      'POST': 'CREATE',
      'PUT': 'UPDATE',
      'DELETE': 'DELETE'
    }
  },
  '/role-permissions': {
    entity: 'ROLE_PERMISSION',
    actionMap: {
      'GET': 'VIEW',
      'POST': 'PERMISSION_GRANTED',
      'PUT': 'UPDATE',
      'DELETE': 'PERMISSION_REVOKED'
    }
  },
  '/announcements': {
    entity: 'ANNOUNCEMENT',
    actionMap: {
      'GET': 'VIEW',
      'POST': 'CREATE',
      'PUT': 'UPDATE',
      'DELETE': 'DELETE'
    }
  },
  '/jobs': {
    entity: 'JOB',
    actionMap: {
      'GET': 'VIEW',
      'POST': 'CREATE',
      'PUT': 'UPDATE',
      'DELETE': 'DELETE'
    }
  },
  '/documents': {
    entity: 'DOCUMENT',
    actionMap: {
      'GET': 'FILE_DOWNLOAD',
      'POST': 'FILE_UPLOAD',
      'DELETE': 'FILE_DELETE'
    }
  },
  '/resources': {
    entity: 'DOCUMENT',
    actionMap: {
      'GET': 'FILE_DOWNLOAD',
      'POST': 'FILE_UPLOAD',
      'DELETE': 'FILE_DELETE'
    }
  },
  '/dashboard': {
    entity: 'DASHBOARD',
    actionMap: {
      'GET': 'VIEW'
    }
  },
  '/notifications': {
    entity: 'NOTIFICATION',
    actionMap: {
      'GET': 'VIEW',
      'POST': 'CREATE',
      'PUT': 'UPDATE',
      'DELETE': 'DELETE'
    }
  },
  '/auth/login': {
    entity: 'SESSION',
    actionMap: {
      'POST': 'LOGIN'
    }
  },
  '/auth/logout': {
    entity: 'SESSION',
    actionMap: {
      'POST': 'LOGOUT'
    }
  },
  '/auth/register': {
    entity: 'USER',
    actionMap: {
      'POST': 'CREATE'
    }
  },
  '/auth/password': {
    entity: 'USER',
    actionMap: {
      'POST': 'PASSWORD_CHANGE',
      'PUT': 'PASSWORD_RESET'
    }
  },
  '/invite': {
    entity: 'INVITATION',
    actionMap: {
      'POST': 'INVITATION_SENT',
      'PUT': 'INVITATION_ACCEPTED',
      'DELETE': 'INVITATION_REJECTED'
    }
  }
};

// Audit logging middleware
export const auditLogMiddleware = (options?: { excludePaths?: string[] }) => {
  const excludePaths = options?.excludePaths || ['/health', '/metrics', '/audit-logs'];

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip if path is excluded
    if (excludePaths.some(path => req.path.includes(path))) {
      return next();
    }

    const startTime = Date.now();
    const originalSend = res.send;
    let responseData: any;

    // Capture response
    res.send = function (data: any) {
      responseData = data;
      res.send = originalSend;
      return originalSend.call(res, data);
    };

    // Store original request data
    const requestData = {
      body: { ...req.body },
      params: { ...req.params },
      query: { ...req.query }
    };

    // Remove sensitive data from logging
    if (requestData.body.password) {
      requestData.body.password = '[REDACTED]';
    }
    if (requestData.body.password_hash) {
      requestData.body.password_hash = '[REDACTED]';
    }

    // Process request
    res.on('finish', async () => {
      try {
        // Extract user data from JWT token
        const user = req.user as any;
        const tenantId = req.params.tenantId || user?.tenantId;

        if (!user || !user.userId || !tenantId) {
          return; // Skip logging for unauthenticated requests
        }

        const userId = user.userId;
        const userName = user.user?.username || user.username || 'Unknown User';
        const userEmail = user.user?.email || user.email || 'unknown@example.com';
        const userRole = user.roles?.[0]?.name || user.roles?.name || 'Unknown';

        // Determine entity and action from route
        let entity = 'UNKNOWN';
        let action = 'UNKNOWN';
        let entityId: string | undefined;
        let entityName: string | undefined;

        // Find matching route pattern
        for (const [pattern, config] of Object.entries(routeMapping)) {
          if (req.path.includes(pattern)) {
            entity = config.entity;
            action = config.actionMap[req.method] || 'UNKNOWN';
            console.log(`Audit Log: Matched route pattern "${pattern}" for path "${req.path}", Entity: ${entity}, Action: ${action}`);
            break;
          }
        }

        // Log if no pattern matched
        if (entity === 'UNKNOWN') {
          console.log(`Audit Log: No pattern matched for path "${req.path}", Method: ${req.method}`);
        }

        // Skip logging for dashboard view events
        if (entity === 'DASHBOARD' && action === 'VIEW') {
          console.log(`Audit Log: Skipping dashboard view event for path "${req.path}"`);
          return;
        }

        // Extract entity ID and name from params or body
        entityId = req.params.id || req.params.userId || req.params.roleId || req.params.jobId || 
                   req.params.announcementId || req.params.documentId || requestData.body._id;
        
        // Try multiple field names for entity name
        entityName = requestData.body.name || requestData.body.username || requestData.body.title || 
                     requestData.body.organizationName || requestData.body.roleName || 
                     requestData.body.subject || requestData.body.fileName;

        // Determine if operation was successful
        const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
        const responseTime = Date.now() - startTime;

        // Parse response to get created/updated entity details
        if (isSuccess && responseData) {
          try {
            const parsed = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
            if (parsed.data) {
              entityId = entityId || parsed.data._id || parsed.data.id;
              entityName = entityName || parsed.data.name || parsed.data.username || 
                          parsed.data.title || parsed.data.subject || parsed.data.fileName ||
                          parsed.data.organizationName || parsed.data.roleName;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }

        // Create audit log entry
        await createAuditLog({
          tenantId,
          userId,
          userName,
          userEmail,
          userRole,
          action,
          entity,
          entityId,
          entityName,
          details: {
            method: req.method,
            path: req.path,
            query: req.query,
            success: isSuccess
          },
          changes: req.method !== 'GET' ? {
            before: undefined, // Would need to fetch previous state for updates
            after: isSuccess ? requestData.body : undefined
          } : undefined,
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.get('user-agent'),
          requestMethod: req.method as any,
          requestUrl: req.originalUrl,
          responseStatus: res.statusCode,
          responseTime,
          errorMessage: !isSuccess ? responseData : undefined,
          sessionId: user.sessionId,
          metadata: {
            department: user.department || user.user?.department,
            browser: parseBrowser(req.get('user-agent') || ''),
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Error creating audit log:', error);
        // Don't fail the request if audit logging fails
      }
    });

    next();
  };
};

// Helper function to parse browser from user agent
function parseBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
}

// Specific middleware for login attempts (including failures)
export const auditLoginAttempt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const originalJson = res.json;
  
  res.json = function (data: any) {
    const responseTime = Date.now() - startTime;
    const isSuccess = res.statusCode === 200;
    
    // Log the login attempt
    createAuditLog({
      tenantId: req.params.tenantId || req.body.tenantId || 'unknown',
      userId: data.userId || 'unknown',
      userName: data.userName || req.body.email || req.body.username || 'Unknown',
      userEmail: req.body.email || 'unknown@example.com',
      userRole: data.userRole || 'Unknown',
      action: isSuccess ? 'LOGIN' : 'LOGIN_FAILED',
      entity: 'SESSION',
      details: {
        loginMethod: req.body.username ? 'username' : 'email',
        success: isSuccess,
        message: data.message
      },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
      requestMethod: 'POST',
      requestUrl: req.originalUrl,
      responseStatus: res.statusCode,
      responseTime,
      errorMessage: !isSuccess ? data.message : undefined,
      metadata: {
        browser: parseBrowser(req.get('user-agent') || ''),
        timestamp: new Date().toISOString()
      }
    }).catch(error => {
      console.error('Error logging login attempt:', error);
    });
    
    res.json = originalJson;
    return originalJson.call(res, data);
  };
  
  next();
};