import { Router } from 'express';
import * as dashboardController from './dashboard.controller';
import { authenticate } from '../../shared/middleware/auth';

const router = Router();

/**
 * @route   GET /api/dashboard/summary
 * @desc    Get dashboard summary metrics (KPIs)
 * @access  All authenticated users
 */
router.get(
  '/summary',
  authenticate,
  dashboardController.getDashboardSummary
);

/**
 * @route   GET /api/dashboard/activity
 * @desc    Get recent activity feed
 * @access  All authenticated users
 */
router.get(
  '/activity',
  authenticate,
  dashboardController.getDashboardActivity
);

/**
 * @route   GET /api/dashboard/analytics
 * @desc    Get analytics data for charts
 * @access  All authenticated users
 */
router.get(
  '/analytics',
  authenticate,
  dashboardController.getDashboardAnalytics
);

export default router;
