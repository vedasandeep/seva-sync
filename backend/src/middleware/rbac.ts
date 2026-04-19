import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

/**
 * Require specific role(s) to access endpoint
 * Must be used after authenticate() middleware
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Authentication required' 
      });
      return;
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Forbidden', 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        userRole: req.user.role
      });
      return;
    }
    
    next();
  };
}

/**
 * Require admin or disaster admin role
 */
export const requireAdmin = requireRole(
  UserRole.DISASTER_ADMIN, 
  UserRole.SUPER_ADMIN
);

/**
 * Require coordinator or admin role
 */
export const requireCoordinator = requireRole(
  UserRole.NGO_COORDINATOR,
  UserRole.DISASTER_ADMIN,
  UserRole.SUPER_ADMIN
);

/**
 * Check if user owns resource or has admin permissions
 */
export function requireOwnershipOrAdmin(userIdGetter: (req: Request) => string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const resourceUserId = userIdGetter(req);
    const isOwner = req.user.userId === resourceUserId;
    const adminRoles: UserRole[] = [UserRole.DISASTER_ADMIN, UserRole.SUPER_ADMIN];
    const isAdmin = adminRoles.includes(req.user.role);
    
    if (!isOwner && !isAdmin) {
      res.status(403).json({ 
        error: 'Forbidden', 
        message: 'You can only access your own resources' 
      });
      return;
    }
    
    next();
  };
}
