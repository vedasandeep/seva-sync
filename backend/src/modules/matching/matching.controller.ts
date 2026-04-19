import { Request, Response, NextFunction } from 'express';
import * as matchingService from './matching.service';
import { prisma } from '../../infrastructure/database';

/**
 * Get best volunteer matches for a task
 * GET /api/matching/task/:taskId
 */
export async function getMatchesForTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { taskId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    const matches = await matchingService.findMatchesForTask(taskId, limit);

    res.json({
      success: true,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get best task matches for a volunteer
 * GET /api/matching/volunteer/:volunteerId
 */
export async function getMatchesForVolunteer(req: Request, res: Response, next: NextFunction) {
  try {
    const { volunteerId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    const matches = await matchingService.findMatchesForVolunteer(volunteerId, limit);

    res.json({
      success: true,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Auto-assign best volunteer to a task
 * POST /api/matching/task/:taskId/auto-assign
 */
export async function autoAssignTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { taskId } = req.params;

    const result = await matchingService.autoAssignTask(taskId);

    if (!result) {
      res.status(404).json({
        success: false,
        error: 'No suitable volunteer found for auto-assignment',
      });
      return;
    }

    res.json({
      success: true,
      data: result,
      message: `Task auto-assigned to ${result.volunteer.name} with score ${result.score}`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get volunteers at risk of burnout
 * GET /api/matching/burnout-risks
 */
export async function getBurnoutRisks(_req: Request, res: Response, next: NextFunction) {
  try {
    const risks = await matchingService.detectBurnoutRisks();

    res.json({
      success: true,
      data: {
        critical: risks.critical,
        warning: risks.warning,
        summary: {
          criticalCount: risks.critical.length,
          warningCount: risks.warning.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Calculate match score for a specific volunteer-task pair
 * POST /api/matching/score
 */
export async function calculateScore(req: Request, res: Response, next: NextFunction) {
  try {
    const { volunteerId, taskId } = req.body;

    // Fetch volunteer and task
    const [volunteer, task] = await Promise.all([
      prisma.volunteer.findUnique({
        where: { id: volunteerId },
        select: {
          id: true,
          name: true,
          skills: true,
          currentLat: true,
          currentLng: true,
          isActive: true,
          burnoutScore: true,
          language: true,
        },
      }),
      prisma.task.findUnique({
        where: { id: taskId },
        select: {
          id: true,
          title: true,
          requiredSkills: true,
          latitude: true,
          longitude: true,
          urgency: true,
          estimatedHours: true,
        },
      }),
    ]);

    if (!volunteer || !task) {
      res.status(404).json({
        success: false,
        error: 'Volunteer or task not found',
      });
      return;
    }

    // Transform to match service types
    const volunteerCandidate: matchingService.VolunteerCandidate = {
      id: volunteer.id,
      name: volunteer.name,
      skills: Array.isArray(volunteer.skills) ? volunteer.skills as string[] : [],
      currentLat: volunteer.currentLat ? Number(volunteer.currentLat) : null,
      currentLng: volunteer.currentLng ? Number(volunteer.currentLng) : null,
      isActive: volunteer.isActive,
      burnoutScore: Number(volunteer.burnoutScore),
      language: volunteer.language,
    };

    const taskRequirements: matchingService.TaskRequirements = {
      id: task.id,
      title: task.title,
      requiredSkills: Array.isArray(task.requiredSkills) ? task.requiredSkills as string[] : [],
      latitude: task.latitude ? Number(task.latitude) : null,
      longitude: task.longitude ? Number(task.longitude) : null,
      urgency: task.urgency,
      estimatedHours: task.estimatedHours,
    };

    const result = matchingService.calculateMatchScore(volunteerCandidate, taskRequirements);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
