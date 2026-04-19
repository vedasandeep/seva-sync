import { Request, Response } from 'express';
import volunteerService from '../services/volunteer.service';

export class VolunteerController {
  /**
   * GET /api/volunteers
   * List all volunteers with filters
   */
  async listVolunteers(req: Request, res: Response): Promise<void> {
    try {
      const result = await volunteerService.listVolunteers(req.query as any);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Bad Request', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * GET /api/volunteers/:id
   * Get volunteer by ID
   */
  async getVolunteerById(req: Request, res: Response): Promise<void> {
    try {
      const volunteer = await volunteerService.getVolunteerById(req.params.id);
      res.json({ volunteer });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: 'Not Found', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * PUT /api/volunteers/:id
   * Update volunteer profile
   */
  async updateVolunteer(req: Request, res: Response): Promise<void> {
    try {
      const volunteer = await volunteerService.updateVolunteer(
        req.params.id,
        req.body
      );
      res.json({
        message: 'Volunteer updated successfully',
        volunteer,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Update Failed', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * POST /api/volunteers/:id/location
   * Update volunteer GPS location
   */
  async updateLocation(req: Request, res: Response): Promise<void> {
    try {
      const { lat, lng } = req.body;
      const result = await volunteerService.updateLocation(
        req.params.id,
        lat,
        lng
      );
      res.json({
        message: 'Location updated successfully',
        location: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Update Failed', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * POST /api/volunteers/:id/checkin
   * Submit wellness check-in
   */
  async submitWellnessCheckin(req: Request, res: Response): Promise<void> {
    try {
      const checkin = await volunteerService.submitWellnessCheckin(
        req.params.id,
        req.body
      );
      res.status(201).json({
        message: 'Wellness check-in submitted successfully',
        checkin,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Checkin Failed', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * GET /api/volunteers/:id/wellness
   * Get wellness history
   */
  async getWellnessHistory(req: Request, res: Response): Promise<void> {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const history = await volunteerService.getWellnessHistory(
        req.params.id,
        days
      );
      res.json({ history });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Bad Request', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * GET /api/volunteers/:id/tasks
   * Get volunteer task history
   */
  async getTaskHistory(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 50;
      const taskLogs = await volunteerService.getTaskHistory(req.params.id, limit);
      res.json({ taskLogs });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Bad Request', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * GET /api/volunteers/:id/stats
   * Get volunteer statistics
   */
  async getVolunteerStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await volunteerService.getVolunteerStats(req.params.id);
      res.json({ stats });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Bad Request', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * GET /api/volunteers/nearby
   * Find volunteers near a location
   */
  async findNearbyVolunteers(req: Request, res: Response): Promise<void> {
    try {
      const { lat, lng, radius, skills } = req.query as any;
      const volunteers = await volunteerService.findNearbyVolunteers(
        parseFloat(lat),
        parseFloat(lng),
        radius ? parseInt(radius, 10) : 10,
        { skills: skills ? skills.split(',') : undefined }
      );
      res.json({ volunteers, count: volunteers.length });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Bad Request', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * DELETE /api/volunteers/:id
   * Deactivate volunteer (soft delete)
   */
  async deactivateVolunteer(req: Request, res: Response): Promise<void> {
    try {
      await volunteerService.deactivateVolunteer(req.params.id);
      res.json({ message: 'Volunteer deactivated successfully' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Operation Failed', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * POST /api/volunteers/:id/reactivate
   * Reactivate volunteer
   */
  async reactivateVolunteer(req: Request, res: Response): Promise<void> {
    try {
      await volunteerService.reactivateVolunteer(req.params.id);
      res.json({ message: 'Volunteer reactivated successfully' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: 'Operation Failed', message: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
}

export default new VolunteerController();
