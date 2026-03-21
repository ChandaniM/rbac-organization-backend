import { AuditLog, IAuditLog } from "../models/audit-log.model";
import { Types } from "mongoose";
import { getRolesByTenant } from "../repo/roles.repo";

interface AuditLogEntry {
  tenantId: string;
  userId: string | Types.ObjectId;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string;
  entity: string;
  entityId?: string;
  entityName?: string;
  details?: Record<string, any>;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestUrl?: string;
  responseStatus?: number;
  responseTime?: number;
  errorMessage?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

interface QueryOptions {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: string;
  entity?: string;
  userRole?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Create audit log entry
export const createAuditLog = async (entry: AuditLogEntry): Promise<IAuditLog> => {
  try {
    const auditLog = await AuditLog.create({
      ...entry,
      userId: new Types.ObjectId(entry.userId as string),
      timestamp: new Date()
    });
    return auditLog;
  } catch (error) {
    console.error("Error creating audit log:", error);
    throw error;
  }
};

// Get audit logs with role-based filtering
export const getAuditLogs = async (
  tenantId: string,
  requestingUserId: string,
  requestingUserRole: string,
  options: QueryOptions = {}
): Promise<{
  data: IAuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: {
    applied: string[];
    available: {
      actions: string[];
      entities: string[];
      users: { id: string; name: string }[];
    };
  };
}> => {
  const {
    page = 1,
    limit = 50,
    startDate,
    endDate,
    userId,
    action,
    entity,
    userRole,
    search,
    sortBy = 'timestamp',
    sortOrder = 'desc'
  } = options;

  // Build base query
  let query: any = { tenantId };

  // Apply role-based filtering
  const rolePermissions = getRolePermissions(requestingUserRole);
  
  if (!rolePermissions.canViewAll) {
    // Non-admin users can only see certain types of logs
    if (rolePermissions.canViewOwnDepartment) {
      // Manager can see logs from their department
      const userInfo = await getUserDepartmentInfo(tenantId, requestingUserId);
      if (userInfo.department) {
        // This would need to be implemented based on your user model
        query.$or = [
          { userId: requestingUserId }, // Own logs
          { 'metadata.department': userInfo.department } // Department logs
        ];
      }
    } else if (rolePermissions.canViewOwn) {
      // Regular users can only see their own logs
      query.userId = requestingUserId;
    }

    // Filter sensitive actions based on role
    if (rolePermissions.excludeActions && rolePermissions.excludeActions.length > 0) {
      query.action = { $nin: rolePermissions.excludeActions };
    }

    // Filter sensitive entities based on role
    if (rolePermissions.excludeEntities && rolePermissions.excludeEntities.length > 0) {
      query.entity = { $nin: rolePermissions.excludeEntities };
    }
  }

  // Apply filters
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }

  if (userId) {
    query.userId = userId;
  }

  if (action) {
    query.action = action;
  }

  if (entity) {
    query.entity = entity;
  }

  if (userRole) {
    query.userRole = userRole;
  }

  if (search) {
    query.$or = [
      { userName: { $regex: search, $options: 'i' } },
      { userEmail: { $regex: search, $options: 'i' } },
      { entityName: { $regex: search, $options: 'i' } },
      { 'details.description': { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  console.log('Audit Log Query:', {
    query,
    skip,
    limit,
    sort,
    requestingUserId,
    requestingUserRole
  });

  // Execute queries
  const [data, total] = await Promise.all([
    AuditLog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(query)
  ]);

  console.log('Audit Log Results:', {
    dataCount: data.length,
    total,
    firstRecord: data[0] ? { action: data[0].action, entity: data[0].entity, timestamp: data[0].timestamp } : null
  });

  // Get available filters (based on user's accessible data)
  const [availableActions, availableEntities, availableUsers] = await Promise.all([
    AuditLog.distinct('action', query),
    AuditLog.distinct('entity', query),
    AuditLog.aggregate([
      { $match: query },
      { $group: { _id: { id: '$userId', name: '$userName' } } },
      { $project: { id: '$_id.id', name: '$_id.name', _id: 0 } },
      { $limit: 100 }
    ])
  ]);

  // Filter out empty/null/undefined values and sort
  const filteredActions = availableActions.filter(a => a && a.trim() !== '').sort();
  const filteredEntities = availableEntities.filter(e => e && e.trim() !== '').sort();

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    filters: {
      applied: Object.keys(options).filter(key => options[key as keyof QueryOptions]),
      available: {
        actions: filteredActions,
        entities: filteredEntities,
        users: availableUsers
      }
    }
  };
};

// Get audit log statistics
export const getAuditLogStats = async (
  tenantId: string,
  requestingUserId: string,
  requestingUserRole: string,
  period: 'day' | 'week' | 'month' = 'week'
): Promise<{
  summary: {
    totalActions: number;
    uniqueUsers: number;
    mostCommonAction: string;
    mostActiveUser: string;
  };
  actionBreakdown: { action: string; count: number }[];
  entityBreakdown: { entity: string; count: number }[];
  timelineData: { date: string; count: number }[];
  userActivity: { userName: string; count: number }[];
}> => {
  const rolePermissions = getRolePermissions(requestingUserRole);
  
  // Build base query with role-based filtering
  let baseQuery: any = { tenantId };
  
  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  if (period === 'day') {
    startDate.setDate(startDate.getDate() - 1);
  } else if (period === 'week') {
    startDate.setDate(startDate.getDate() - 7);
  } else {
    startDate.setMonth(startDate.getMonth() - 1);
  }
  
  baseQuery.timestamp = { $gte: startDate, $lte: endDate };

  if (!rolePermissions.canViewAll) {
    if (rolePermissions.canViewOwn) {
      baseQuery.userId = requestingUserId;
    }
  }

  // Get statistics
  const [
    totalActions,
    uniqueUsers,
    actionBreakdown,
    entityBreakdown,
    userActivity
  ] = await Promise.all([
    AuditLog.countDocuments(baseQuery),
    AuditLog.distinct('userId', baseQuery).then(users => users.length),
    AuditLog.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { action: '$_id', count: 1, _id: 0 } }
    ]),
    AuditLog.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$entity', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { entity: '$_id', count: 1, _id: 0 } }
    ]),
    AuditLog.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$userName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { userName: '$_id', count: 1, _id: 0 } }
    ])
  ]);

  // Get timeline data
  const timelineData = await AuditLog.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: {
          $dateToString: {
            format: period === 'day' ? '%Y-%m-%d %H:00' : '%Y-%m-%d',
            date: '$timestamp'
          }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } },
    { $project: { date: '$_id', count: 1, _id: 0 } }
  ]);

  return {
    summary: {
      totalActions,
      uniqueUsers,
      mostCommonAction: actionBreakdown[0]?.action || 'N/A',
      mostActiveUser: userActivity[0]?.userName || 'N/A'
    },
    actionBreakdown,
    entityBreakdown,
    timelineData,
    userActivity
  };
};

// Get single audit log by ID
export const getAuditLogById = async (
  tenantId: string,
  logId: string,
  requestingUserId: string,
  requestingUserRole: string
): Promise<IAuditLog | null> => {
  const rolePermissions = getRolePermissions(requestingUserRole);
  
  let query: any = {
    _id: logId,
    tenantId
  };

  if (!rolePermissions.canViewAll) {
    if (rolePermissions.canViewOwn) {
      query.userId = requestingUserId;
    }
  }

  return await AuditLog.findOne(query);
};

// Export audit logs
export const exportAuditLogs = async (
  tenantId: string,
  requestingUserId: string,
  requestingUserRole: string,
  format: 'csv' | 'json' = 'csv',
  options: QueryOptions = {}
): Promise<string | object[]> => {
  // Create audit log for the export action itself
  await createAuditLog({
    tenantId,
    userId: requestingUserId,
    userName: 'System', // This would be fetched from user info
    userEmail: 'system@example.com', // This would be fetched from user info
    userRole: requestingUserRole,
    action: 'EXPORT',
    entity: 'AUDIT_LOG',
    details: {
      format,
      filters: options
    }
  });

  const result = await getAuditLogs(tenantId, requestingUserId, requestingUserRole, {
    ...options,
    limit: 10000 // Max export limit
  });

  if (format === 'json') {
    return result.data;
  }

  // Convert to CSV
  const headers = [
    'Timestamp',
    'User',
    'Email',
    'Role',
    'Action',
    'Entity',
    'Entity Name',
    'Details',
    'IP Address',
    'Response Status'
  ];

  const rows = result.data.map(log => [
    log.timestamp.toISOString(),
    log.userName,
    log.userEmail,
    log.userRole,
    log.action,
    log.entity,
    log.entityName || '',
    JSON.stringify(log.details || {}),
    log.ipAddress || '',
    log.responseStatus || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};

// Helper function to get role permissions
function getRolePermissions(role: string): {
  canViewAll: boolean;
  canViewOwnDepartment: boolean;
  canViewOwn: boolean;
  excludeActions?: string[];
  excludeEntities?: string[];
} {
  // Define role-based permissions
  const permissions: Record<string, any> = {
    'Super Admin': {
      canViewAll: true,
      canViewOwnDepartment: true,
      canViewOwn: true
    },
    'Admin': {
      canViewAll: true,
      canViewOwnDepartment: true,
      canViewOwn: true,
      excludeActions: ['PASSWORD_CHANGE', 'LOGIN_FAILED'],
      excludeEntities: []
    },
    'Manager': {
      canViewAll: false,
      canViewOwnDepartment: true,
      canViewOwn: true,
      excludeActions: ['PASSWORD_CHANGE', 'LOGIN_FAILED', 'PERMISSION_GRANTED', 'PERMISSION_REVOKED'],
      excludeEntities: ['PERMISSION', 'ROLE_PERMISSION']
    },
    'Employee': {
      canViewAll: false,
      canViewOwnDepartment: false,
      canViewOwn: true,
      excludeActions: ['PASSWORD_CHANGE', 'LOGIN_FAILED', 'PERMISSION_GRANTED', 'PERMISSION_REVOKED', 'ROLE_ASSIGNED', 'ROLE_REMOVED'],
      excludeEntities: ['PERMISSION', 'ROLE_PERMISSION', 'ROLE', 'USER']
    },
    'Viewer': {
      canViewAll: false,
      canViewOwnDepartment: false,
      canViewOwn: true,
      excludeActions: ['PASSWORD_CHANGE', 'LOGIN_FAILED', 'CREATE', 'UPDATE', 'DELETE'],
      excludeEntities: ['PERMISSION', 'ROLE_PERMISSION', 'ROLE', 'USER']
    }
  };

  return permissions[role] || {
    canViewAll: false,
    canViewOwnDepartment: false,
    canViewOwn: true,
    excludeActions: [],
    excludeEntities: []
  };
}

// Helper function to get user department info
async function getUserDepartmentInfo(tenantId: string, userId: string): Promise<{ department?: string }> {
  // This would be implemented based on your User model
  // For now, returning empty object
  return {};
}