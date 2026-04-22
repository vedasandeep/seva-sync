import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { Permission } from '../enums/Permission';

const router = Router();
const prisma = new PrismaClient();

// Get activity summary (MUST be before GET / to avoid matching as catch-all)
router.get('/summary', authenticate, requirePermission(Permission.ADMIN_VIEW_ANALYTICS), async (_req: Request, res: Response): Promise<any> => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get counts for various periods
    const [
      totalUsers,
      activeToday,
      pendingInvites,
      loginsToday,
      loginsYesterday,
      loginsWeek,
      failedLoginsToday,
      failedLoginsWeek,
      tasksToday,
      tasksWeek,
      exportsToday,
      exportsWeek,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.auditLog.count({
        where: { createdAt: { gte: today }, status: 'success' },
      }),
      prisma.user.count({
        where: { isActive: false }, // Assuming inactive = invite pending
      }),
      prisma.auditLog.count({
        where: { action: 'LOGIN', createdAt: { gte: today }, status: 'success' },
      }),
      prisma.auditLog.count({
        where: {
          action: 'LOGIN',
          createdAt: { gte: yesterday, lt: today },
          status: 'success',
        },
      }),
      prisma.auditLog.count({
        where: {
          action: 'LOGIN',
          createdAt: { gte: weekAgo },
          status: 'success',
        },
      }),
      prisma.auditLog.count({
        where: {
          action: { contains: 'LOGIN' },
          createdAt: { gte: today },
          status: 'failure',
        },
      }),
      prisma.auditLog.count({
        where: {
          action: { contains: 'LOGIN' },
          createdAt: { gte: weekAgo },
          status: 'failure',
        },
      }),
      prisma.auditLog.count({
        where: {
          resource: 'TASK',
          createdAt: { gte: today },
          status: 'success',
        },
      }),
      prisma.auditLog.count({
        where: {
          resource: 'TASK',
          createdAt: { gte: weekAgo },
          status: 'success',
        },
      }),
      prisma.auditLog.count({
        where: {
          action: 'EXPORT',
          createdAt: { gte: today },
          status: 'success',
        },
      }),
      prisma.auditLog.count({
        where: {
          action: 'EXPORT',
          createdAt: { gte: weekAgo },
          status: 'success',
        },
      }),
    ]);

    // Get top actions
    const topActionsResults = await prisma.auditLog.groupBy({
      by: ['action'],
      _count: true,
      orderBy: { _count: { action: 'desc' } },
      take: 4,
    });

    const topActions = topActionsResults.map((item) => ({
      action: item.action,
      count: item._count,
    }));

    const taskCompletionRate = tasksWeek > 0 ? ((tasksToday / tasksWeek) * 100).toFixed(1) : '0';

    const summary = {
      totalUsers,
      activeToday,
      invitesPending: pendingInvites,
      taskCompletionRate: parseFloat(taskCompletionRate),
      logins: {
        today: loginsToday,
        yesterday: loginsYesterday,
        thisWeek: loginsWeek,
      },
      failedLogins: {
        today: failedLoginsToday,
        thisWeek: failedLoginsWeek,
      },
      taskAssignments: {
        today: tasksToday,
        thisWeek: tasksWeek,
      },
      reportExports: {
        today: exportsToday,
        thisWeek: exportsWeek,
      },
      topActions,
    };

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Failed to fetch activity summary:', error);
    res.status(500).json({ error: 'Failed to fetch activity summary' });
  }
});

// Export audit logs as CSV (MUST be before GET /)
router.get('/export', authenticate, requirePermission(Permission.ADMIN_VIEW_AUDIT), async (req: Request, res: Response): Promise<any> => {
  try {
    const action = req.query.action as string;
    const status = req.query.status as string;

    // Build where clause
    const where: any = {};

    if (action && action !== 'all') {
      where.action = action;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV header
    const headers = 'Timestamp,User,Action,Resource,Status,IP Address,Error Message\n';

    // Generate CSV rows
    const rows = logs
      .map((log) =>
        [
          new Date(log.createdAt).toISOString(),
          log.user?.name || 'System',
          log.action,
          log.resource,
          log.status,
          log.ipAddress || 'N/A',
          log.errorMessage || '',
        ]
          .map((field) => `"${field}"`)
          .join(',')
      )
      .join('\n');

    const csv = headers + rows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`
    );
    res.send(csv);
  } catch (error) {
    console.error('Failed to export audit logs:', error);
    res.status(500).json({ error: 'Failed to export logs' });
  }
});

// Get audit logs (generic catch-all, MUST be last)
router.get('/', authenticate, requirePermission(Permission.ADMIN_VIEW_AUDIT), async (req: Request, res: Response): Promise<any> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string;
    const action = req.query.action as string;
    const status = req.query.status as string;

    // Build where clause for filtering
    const where: any = {};

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { action: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search } },
      ];
    }

    if (action && action !== 'all') {
      where.action = action;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        logs: logs.map((log) => ({
          ...log,
          userName: log.user?.name || 'System',
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
