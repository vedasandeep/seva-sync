import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyVolunteerToken, TokenPayload, VolunteerTokenPayload } from '../utils/jwt';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      volunteer?: VolunteerTokenPayload;
    }
  }
}

/**
 * Authenticate admin/coordinator users via JWT
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
    return;
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Unauthorized', 
      message: error instanceof Error ? error.message : 'Invalid token'
    });
  }
}

/**
 * Authenticate volunteers via JWT (phone-based auth)
 */
export function authenticateVolunteer(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
    return;
  }
  
  const token = authHeader.substring(7);
  
  try {
    const payload = verifyVolunteerToken(token);
    req.volunteer = payload;
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Unauthorized', 
      message: error instanceof Error ? error.message : 'Invalid token'
    });
  }
}

/**
 * Optional authentication - attach user if token present, but don't fail
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Silently fail - user remains undefined
    }
  }
  
  next();
}
