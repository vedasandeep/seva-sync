import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get notification preferences (MUST be before GET /)
router.get('/preferences', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: { userId },
      });
    }

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Failed to fetch preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update notification preferences
router.put('/preferences', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    const {
      emailEnabled,
      smsEnabled,
      pushEnabled,
      inAppEnabled,
      quietHoursStart,
      quietHoursEnd,
      loginAlertEnabled,
      taskAssignedEnabled,
      taskCompletedEnabled,
      reportReadyEnabled,
      inviteReceivedEnabled,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: { userId },
      });
    }

    const updated = await prisma.notificationPreference.update({
      where: { userId },
      data: {
        emailEnabled: emailEnabled ?? preferences.emailEnabled,
        smsEnabled: smsEnabled ?? preferences.smsEnabled,
        pushEnabled: pushEnabled ?? preferences.pushEnabled,
        inAppEnabled: inAppEnabled ?? preferences.inAppEnabled,
        quietHoursStart: quietHoursStart ?? preferences.quietHoursStart,
        quietHoursEnd: quietHoursEnd ?? preferences.quietHoursEnd,
        loginAlertEnabled: loginAlertEnabled ?? preferences.loginAlertEnabled,
        taskAssignedEnabled: taskAssignedEnabled ?? preferences.taskAssignedEnabled,
        taskCompletedEnabled: taskCompletedEnabled ?? preferences.taskCompletedEnabled,
        reportReadyEnabled: reportReadyEnabled ?? preferences.reportReadyEnabled,
        inviteReceivedEnabled: inviteReceivedEnabled ?? preferences.inviteReceivedEnabled,
      },
    });

    res.json({
      success: true,
      message: 'Notification preferences updated',
      data: updated,
    });
  } catch (error) {
    console.error('Failed to update preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Mark all notifications as read (MUST be before POST /:id/read)
router.post('/read-all', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });

    res.json({
      success: true,
      message: `${result.count} notifications marked as read`,
      data: { updatedCount: result.count },
    });
  } catch (error) {
    console.error('Failed to update notifications:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// Mark notification as read
router.post('/:id/read', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: updated,
    });
  } catch (error) {
    console.error('Failed to update notification:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Delete notification
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Notification deleted',
      data: { notificationId: id },
    });
  } catch (error) {
    console.error('Failed to delete notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Get all notifications for the authenticated user (MUST be last)
router.get('/', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

export default router;
