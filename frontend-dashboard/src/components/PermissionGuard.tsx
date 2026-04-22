import React from 'react';
import { usePermission } from '../hooks/usePermission';
import { Permission } from '../enums/Permission';

interface PermissionGuardProps {
  permissions: Permission[];
  requireAll?: boolean; // If true, user must have ALL permissions; if false, user must have ANY
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissions,
  requireAll = true,
  children,
  fallback = null,
}) => {
  const { canAccessAll, canAccessAny } = usePermission();

  const hasAccess = requireAll ? canAccessAll(permissions) : canAccessAny(permissions);

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionGuard;
