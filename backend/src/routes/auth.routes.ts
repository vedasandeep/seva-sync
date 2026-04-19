import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate, authenticateVolunteer } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import {
  registerUserSchema,
  registerVolunteerSchema,
  loginSchema,
  loginVolunteerSchema,
  refreshTokenSchema,
} from '../types/auth.schemas';

const router = Router();

// User (Admin/Coordinator) authentication
router.post('/register', validateBody(registerUserSchema), (req, res) => 
  authController.registerUser(req, res)
);

router.post('/login', validateBody(loginSchema), (req, res) => 
  authController.loginUser(req, res)
);

// Volunteer authentication
router.post('/register-volunteer', validateBody(registerVolunteerSchema), (req, res) => 
  authController.registerVolunteer(req, res)
);

router.post('/login-volunteer', validateBody(loginVolunteerSchema), (req, res) => 
  authController.loginVolunteer(req, res)
);

// Token refresh
router.post('/refresh', validateBody(refreshTokenSchema), (req, res) => 
  authController.refreshToken(req, res)
);

// Get current user
router.get('/me', authenticate, (req, res) => 
  authController.getCurrentUser(req, res)
);

// Get current volunteer
router.get('/me-volunteer', authenticateVolunteer, (req, res) => 
  authController.getCurrentVolunteer(req, res)
);

export default router;
