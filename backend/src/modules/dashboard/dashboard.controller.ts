import { Request, Response } from 'express';
import * as dashboardService from './dashboard.service';

/**
 * GET /api/dashboard/summary
 * Get dashboard summary metrics
 */
export const getDashboardSummary = async (_req: Request, res: Response) => {
  try {
    const summary = await dashboardService.getDashboardSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
};

/**
 * GET /api/dashboard/activity
 * Get recent activity feed
 */
export const getDashboardActivity = async (_req: Request, res: Response) => {
  try {
    const activity = await dashboardService.getDashboardActivity();
    res.json(activity);
  } catch (error) {
    console.error('Error fetching dashboard activity:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard activity' });
  }
};

/**
 * GET /api/dashboard/analytics
 * Get analytics data for charts
 */
export const getDashboardAnalytics = async (_req: Request, res: Response) => {
  try {
    const analytics = await dashboardService.getDashboardAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
};
