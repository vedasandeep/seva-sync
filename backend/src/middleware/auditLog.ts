import { Request, Response, NextFunction } from 'express';

export enum AuditActionType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  FAILED_LOGIN = 'FAILED_LOGIN',
  CREATE = 'CREATE',
  READ = 'READ',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  SESSION_REVOKE = 'SESSION_REVOKE',
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: AuditActionType;
  resource: string;
  resourceId: string;
  status: 'success' | 'failure';
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// In-memory audit log storage (replace with database in production)
const auditLogs: AuditLogEntry[] = [];

/**
 * Audit logging middleware
 * Automatically logs all requests with user context
 */
export function auditLog(action: AuditActionType, resource: string, getDetails?: (req: Request, res: Response) => string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Capture the original send function
    const originalSend = res.send;

    res.send = function (data: any) {
      // Log the audit entry after response is sent
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      const userId = req.user?.userId || 'anonymous';
      const resourceId = req.params.id || req.body?.id || 'unknown';
      const status = res.statusCode < 400 ? 'success' : 'failure';
      const details = getDetails ? getDetails(req, res) : `${action} on ${resource}`;

      const logEntry: AuditLogEntry = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        action,
        resource,
        resourceId,
        status,
        details,
        ipAddress,
        userAgent,
        timestamp: new Date(),
      };

      auditLogs.push(logEntry);

      // Keep only last 10000 logs in memory
      if (auditLogs.length > 10000) {
        auditLogs.shift();
      }

      console.log(`[AUDIT] ${userId} - ${action} - ${resource}:${resourceId} - ${status}`);

      // Call the original send function
      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Get all audit logs (for development/testing)
 */
export function getAuditLogs(filters?: { userId?: string; action?: AuditActionType; resource?: string }): AuditLogEntry[] {
  let filtered = auditLogs;

  if (filters?.userId) {
    filtered = filtered.filter((log) => log.userId === filters.userId);
  }
  if (filters?.action) {
    filtered = filtered.filter((log) => log.action === filters.action);
  }
  if (filters?.resource) {
    filtered = filtered.filter((log) => log.resource === filters.resource);
  }

  return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Clear audit logs (for development/testing)
 */
export function clearAuditLogs(): void {
  auditLogs.length = 0;
}

export default auditLog;
