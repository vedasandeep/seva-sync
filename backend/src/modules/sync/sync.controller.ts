import { Router, Request, Response } from 'express';
import { syncService } from './sync.service';
import { authenticateVolunteer } from '../../middleware/auth';

const router = Router();

/**
 * POST /api/v1/sync/bulk
 * Bulk sync multiple task updates
 */
router.post('/bulk', authenticateVolunteer, async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    const volunteerId = req.volunteer?.volunteerId;

    if (!volunteerId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items must be an array' });
    }

    // Limit bulk operations to prevent abuse
    if (items.length > 50) {
      return res.status(400).json({ message: 'Maximum 50 items per sync' });
    }

    const result = await syncService.bulkSync(items, volunteerId);

    return res.json({
      message: 'Sync completed',
      ...result,
    });
  } catch (error) {
    console.error('[SyncController] Bulk sync error:', error);
    return res.status(500).json({ message: 'Sync failed' });
  }
});

/**
 * GET /api/v1/sync/status
 * Get sync status and health check
 */
router.get('/status', authenticateVolunteer, async (req: Request, res: Response) => {
  try {
    const volunteerId = req.volunteer?.volunteerId;

    if (!volunteerId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const status = await syncService.getSyncStatus(volunteerId);

    return res.json({
      message: 'Sync status retrieved',
      data: status,
    });
  } catch (error) {
    console.error('[SyncController] Status error:', error);
    return res.status(500).json({ message: 'Failed to get sync status' });
  }
});

/**
 * POST /api/v1/sync/conflict-resolution
 * Resolve a conflict by choosing local or server version
 */
router.post('/conflict-resolution', authenticateVolunteer, async (req: Request, res: Response) => {
  try {
    const { taskId, resolution, localData } = req.body;
    const volunteerId = req.volunteer?.volunteerId;

    if (!volunteerId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!taskId || !resolution) {
      return res.status(400).json({ message: 'taskId and resolution are required' });
    }

    if (!['local', 'server'].includes(resolution)) {
      return res.status(400).json({ message: 'resolution must be "local" or "server"' });
    }

    const task = await syncService.resolveConflict(
      taskId,
      resolution,
      localData || {},
      volunteerId
    );

    return res.json({
      message: 'Conflict resolved',
      task,
    });
  } catch (error) {
    console.error('[SyncController] Conflict resolution error:', error);
    if (error instanceof Error && error.message === 'Task not found') {
      return res.status(404).json({ message: 'Task not found' });
    }
    return res.status(500).json({ message: 'Failed to resolve conflict' });
  }
});

export default router;
