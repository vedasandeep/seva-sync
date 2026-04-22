// User Management Permissions
export enum Permission {
  // User Management (4 permissions)
  USER_VIEW = 'user:view',
  USER_CREATE = 'user:create',
  USER_EDIT = 'user:edit',
  USER_DELETE = 'user:delete',

  // Disaster Management (5 permissions)
  DISASTER_VIEW = 'disaster:view',
  DISASTER_CREATE = 'disaster:create',
  DISASTER_EDIT = 'disaster:edit',
  DISASTER_DELETE = 'disaster:delete',
  DISASTER_ACTIVATE = 'disaster:activate',

  // Task Management (5 permissions)
  TASK_VIEW = 'task:view',
  TASK_CREATE = 'task:create',
  TASK_EDIT = 'task:edit',
  TASK_DELETE = 'task:delete',
  TASK_ASSIGN = 'task:assign',

  // Report Management (4 permissions)
  REPORT_VIEW = 'report:view',
  REPORT_CREATE = 'report:create',
  REPORT_EDIT = 'report:edit',
  REPORT_EXPORT = 'report:export',

  // Admin Permissions (4 permissions)
  ADMIN_VIEW_AUDIT = 'admin:view_audit',
  ADMIN_MANAGE_ROLES = 'admin:manage_roles',
  ADMIN_VIEW_ANALYTICS = 'admin:view_analytics',
  ADMIN_SYSTEM_SETTINGS = 'admin:system_settings',
}

import { UserRole } from '@prisma/client';

export type Role = 'SUPER_ADMIN' | 'DISASTER_ADMIN' | 'NGO_COORDINATOR' | 'VOLUNTEER';

export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // All permissions for super admin
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_EDIT,
    Permission.USER_DELETE,
    Permission.DISASTER_VIEW,
    Permission.DISASTER_CREATE,
    Permission.DISASTER_EDIT,
    Permission.DISASTER_DELETE,
    Permission.DISASTER_ACTIVATE,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_EDIT,
    Permission.TASK_DELETE,
    Permission.TASK_ASSIGN,
    Permission.REPORT_VIEW,
    Permission.REPORT_CREATE,
    Permission.REPORT_EDIT,
    Permission.REPORT_EXPORT,
    Permission.ADMIN_VIEW_AUDIT,
    Permission.ADMIN_MANAGE_ROLES,
    Permission.ADMIN_VIEW_ANALYTICS,
    Permission.ADMIN_SYSTEM_SETTINGS,
  ],
  [UserRole.DISASTER_ADMIN]: [
    // Disaster and task management
    Permission.DISASTER_VIEW,
    Permission.DISASTER_CREATE,
    Permission.DISASTER_EDIT,
    Permission.DISASTER_DELETE,
    Permission.DISASTER_ACTIVATE,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_EDIT,
    Permission.TASK_DELETE,
    Permission.TASK_ASSIGN,
    Permission.REPORT_VIEW,
    Permission.REPORT_CREATE,
    Permission.REPORT_EDIT,
    Permission.REPORT_EXPORT,
    Permission.USER_VIEW,
    Permission.ADMIN_VIEW_AUDIT,
    Permission.ADMIN_VIEW_ANALYTICS,
  ],
  [UserRole.NGO_COORDINATOR]: [
    // Task and report management
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_EDIT,
    Permission.TASK_ASSIGN,
    Permission.REPORT_VIEW,
    Permission.REPORT_CREATE,
    Permission.REPORT_EDIT,
    Permission.REPORT_EXPORT,
    Permission.DISASTER_VIEW,
    Permission.USER_VIEW,
  ],
  [UserRole.VOLUNTEER]: [
    // View-only and task assignment
    Permission.TASK_VIEW,
    Permission.DISASTER_VIEW,
  ],
};

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return RolePermissions[role].includes(permission);
};

export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.some((permission) => hasPermission(role, permission));
};

export const hasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.every((permission) => hasPermission(role, permission));
};
