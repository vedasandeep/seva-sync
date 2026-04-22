import { useAuth } from '../lib/auth';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '../enums/Permission';

export const usePermission = () => {
  const { user } = useAuth();

  const canAccess = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role as any, permission);
  };

  const canAccessAny = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAnyPermission(user.role as any, permissions);
  };

  const canAccessAll = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAllPermissions(user.role as any, permissions);
  };

  const isAdmin = (): boolean => {
    if (!user) return false;
    return ['SUPER_ADMIN', 'DISASTER_ADMIN'].includes(user.role);
  };

  return {
    canAccess,
    canAccessAny,
    canAccessAll,
    isAdmin,
    user,
  };
};

export default usePermission;
