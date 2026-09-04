import { Schema, model, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
  tenantId: string;
  userId: Types.ObjectId;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string; // CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT, EXPORT, etc.
  entity: string; // USER, ORGANIZATION, ROLE, PERMISSION, ANNOUNCEMENT, JOB, DOCUMENT, etc.
  entityId?: string;
  entityName?: string;
  details?: Record<string, any>; // Additional details about the action
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestUrl?: string;
  responseStatus?: number;
  responseTime?: number; // in milliseconds
  errorMessage?: string;
  sessionId?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  metadata?: Record<string, any>;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    tenantId: { 
      type: String, 
      required: true, 
      index: true 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true 
    },
    userName: { 
      type: String, 
      required: true 
    },
    userEmail: { 
      type: String, 
      required: true 
    },
    userRole: { 
      type: String, 
      required: true,
      index: true 
    },
    action: { 
      type: String, 
      required: true,
      index: true,
      enum: [
        "CREATE", "UPDATE", "DELETE", "VIEW", "EXPORT", "IMPORT",
        "LOGIN", "LOGOUT", "LOGIN_FAILED", "PASSWORD_RESET", "PASSWORD_CHANGE",
        "PERMISSION_GRANTED", "PERMISSION_REVOKED", "ROLE_ASSIGNED", "ROLE_REMOVED",
        "INVITATION_SENT", "INVITATION_ACCEPTED", "INVITATION_REJECTED",
        "FILE_UPLOAD", "FILE_DOWNLOAD", "FILE_DELETE",
        "SETTINGS_CHANGED", "BULK_ACTION", "APPROVAL", "REJECTION"
      ]
    },
    entity: { 
      type: String, 
      required: true,
      index: true,
      enum: [
        "USER", "ORGANIZATION", "ROLE", "PERMISSION", "ROLE_PERMISSION",
        "ANNOUNCEMENT", "JOB", "DOCUMENT", "DASHBOARD", "SETTINGS",
        "INVITATION", "SESSION", "FILE", "REPORT", "AUDIT_LOG",
        "PROJECT", "TASK", "TASK_COMMENT", "TASK_ACTIVITY",
        "NOTIFICATION", "QUEUE_MONITOR", "DEDUPLICATION"
      ]
    },
    entityId: { 
      type: String,
      index: true 
    },
    entityName: { 
      type: String 
    },
    details: { 
      type: Schema.Types.Mixed 
    },
    changes: {
      before: { type: Schema.Types.Mixed },
      after: { type: Schema.Types.Mixed }
    },
    ipAddress: { 
      type: String 
    },
    userAgent: { 
      type: String 
    },
    requestMethod: { 
      type: String,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] 
    },
    requestUrl: { 
      type: String 
    },
    responseStatus: { 
      type: Number 
    },
    responseTime: { 
      type: Number 
    },
    errorMessage: { 
      type: String 
    },
    sessionId: { 
      type: String 
    },
    location: {
      country: { type: String },
      city: { type: String },
      region: { type: String }
    },
    metadata: { 
      type: Schema.Types.Mixed 
    },
    timestamp: { 
      type: Date, 
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true,
    collection: "audit_logs"
  }
);

// Create compound indexes for efficient querying
AuditLogSchema.index({ tenantId: 1, timestamp: -1 });
AuditLogSchema.index({ tenantId: 1, userId: 1, timestamp: -1 });
AuditLogSchema.index({ tenantId: 1, entity: 1, action: 1, timestamp: -1 });
AuditLogSchema.index({ tenantId: 1, userRole: 1, timestamp: -1 });

export const AuditLog = model<IAuditLog>("AuditLog", AuditLogSchema);