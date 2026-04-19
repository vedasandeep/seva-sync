import { Request, Response } from 'express';
import authService from '../services/auth.service';

export class AuthController {
  /**
   * POST /api/auth/register
   * Register new admin/coordinator user
   */
  async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.registerUser(req.body);
      
      res.status(201).json({
        message: 'User registered successfully',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ 
          error: 'Registration Failed', 
          message: error.message 
        });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
  
  /**
   * POST /api/auth/register-volunteer
   * Register new volunteer (phone-based)
   */
  async registerVolunteer(req: Request, res: Response): Promise<void> {
    try {
      const volunteer = await authService.registerVolunteer(req.body);
      
      res.status(201).json({
        message: 'Volunteer registered successfully',
        volunteer,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ 
          error: 'Registration Failed', 
          message: error.message 
        });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
  
  /**
   * POST /api/auth/login
   * Login admin/coordinator user
   */
  async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.loginUser(req.body);
      
      res.json({
        message: 'Login successful',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ 
          error: 'Authentication Failed', 
          message: error.message 
        });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
  
  /**
   * POST /api/auth/login-volunteer
   * Login volunteer (phone-based)
   */
  async loginVolunteer(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.loginVolunteer(req.body);
      
      res.json({
        message: 'Login successful',
        volunteer: result.volunteer,
        accessToken: result.accessToken,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ 
          error: 'Authentication Failed', 
          message: error.message 
        });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
  
  /**
   * POST /api/auth/refresh
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshAccessToken(refreshToken);
      
      res.json({
        message: 'Token refreshed successfully',
        accessToken: result.accessToken,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ 
          error: 'Token Refresh Failed', 
          message: error.message 
        });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
  
  /**
   * GET /api/auth/me
   * Get current user profile
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      const user = await authService.getCurrentUser(req.user.userId);
      res.json({ user });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ 
          error: 'Not Found', 
          message: error.message 
        });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
  
  /**
   * GET /api/auth/me-volunteer
   * Get current volunteer profile
   */
  async getCurrentVolunteer(req: Request, res: Response): Promise<void> {
    try {
      if (!req.volunteer) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      const volunteer = await authService.getCurrentVolunteer(req.volunteer.volunteerId);
      res.json({ volunteer });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ 
          error: 'Not Found', 
          message: error.message 
        });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
}

export default new AuthController();
