import { Request, Response } from 'express';
import * as ivrAnalyticsService from './ivr-analytics.service';

/**
 * IVR Analytics Controller
 * Endpoints for retrieving IVR call analytics and metrics
 * Used by dashboard and reports pages
 */

/**
 * GET /api/ivr/analytics
 * Get overall IVR analytics
 */
export async function getIvrAnalytics(req: Request, res: Response) {
  try {
    const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
    const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;

    const analytics = await ivrAnalyticsService.getIvrAnalytics(startDate, endDate);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('[IVR Analytics] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/ivr/calls
 * Get recent IVR calls with optional filtering
 */
export async function getRecentCalls(req: Request, res: Response) {
  try {
    const limit = req.query.limit ? parseInt(String(req.query.limit)) : 50;
    const calls = await ivrAnalyticsService.getRecentCalls(Math.min(limit, 500));

    res.json({
      success: true,
      data: calls,
      total: calls.length,
    });
  } catch (error) {
    console.error('[IVR Analytics] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/ivr/calls/:volunteerId
 * Get IVR calls for a specific volunteer
 */
export async function getVolunteerCalls(req: Request, res: Response) {
  try {
    const { volunteerId } = req.params;
    const calls = await ivrAnalyticsService.getCallsByVolunteer(volunteerId);

    res.json({
      success: true,
      data: calls,
      total: calls.length,
    });
  } catch (error) {
    console.error('[IVR Analytics] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/ivr/statistics
 * Get detailed call statistics for a date range
 */
export async function getCallStatistics(req: Request, res: Response) {
  try {
    const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : new Date();

    const statistics = await ivrAnalyticsService.getCallStatistics(startDate, endDate);

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error('[IVR Analytics] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /api/ivr/adoption
 * Get IVR adoption metrics
 */
export async function getAdoptionMetrics(_req: Request, res: Response) {
  try {
    const metrics = await ivrAnalyticsService.getAdoptionMetrics();

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('[IVR Analytics] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
