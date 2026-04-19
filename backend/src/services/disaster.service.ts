import { Prisma, DisasterStatus, DisasterType } from '@prisma/client';
import { prisma } from '../utils/prisma';

export interface CreateDisasterInput {
  name: string;
  type: DisasterType;
  location: string;
  latitude?: number;
  longitude?: number;
  startDate: Date;
}

export interface UpdateDisasterInput {
  name?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status?: DisasterStatus;
  endDate?: Date;
}

export interface DisasterFilters {
  status?: DisasterStatus;
  type?: DisasterType;
  limit?: number;
  offset?: number;
  page?: number;
}

/**
 * Create new disaster event
 */
export async function createDisaster(input: CreateDisasterInput) {
  const disaster = await prisma.disaster.create({
    data: {
      name: input.name,
      type: input.type,
      location: input.location,
      latitude: input.latitude,
      longitude: input.longitude,
      startDate: input.startDate,
      status: DisasterStatus.ACTIVE,
    },
  });

  return disaster;
}

/**
 * Get all disasters with filters
 */
export async function listDisasters(filters: DisasterFilters = {}) {
  const { status, type, limit = 50, offset, page = 1 } = filters;
  const skip = offset ?? (page - 1) * limit;

  const where: Prisma.DisasterWhereInput = {
    ...(status && { status }),
    ...(type && { type }),
  };

  const [disasters, total] = await Promise.all([
    prisma.disaster.findMany({
      where,
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
      take: limit,
      skip,
    }),
    prisma.disaster.count({ where }),
  ]);

  // Calculate task stats for each disaster
  const disastersWithStats = disasters.map((disaster) => {
    const { tasks, _count, ...disasterData } = disaster;
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const openTasks = tasks.filter((t) => t.status === 'OPEN').length;

    return {
      ...disasterData,
      totalTasks: _count.tasks,
      completedTasks,
      openTasks,
    };
  });

  return {
    disasters: disastersWithStats,
    pagination: {
      total,
      limit,
      offset: skip,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get disaster by ID with full details
 */
export async function getDisasterById(id: string) {
  const disaster = await prisma.disaster.findUnique({
    where: { id },
    include: {
      tasks: {
        select: {
          id: true,
          title: true,
          status: true,
          urgency: true,
          assignedVolunteerId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      },
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  if (!disaster) {
    throw new Error('Disaster not found');
  }

  // Calculate statistics
  const { tasks, _count, ...disasterData } = disaster;
  const stats = {
    totalTasks: _count.tasks,
    completedTasks: tasks.filter((t) => t.status === 'COMPLETED').length,
    assignedTasks: tasks.filter((t) => t.status === 'ASSIGNED').length,
    inProgressTasks: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    openTasks: tasks.filter((t) => t.status === 'OPEN').length,
    criticalTasks: tasks.filter((t) => t.urgency === 'CRITICAL').length,
    activeVolunteers: new Set(
      tasks.filter((t) => t.assignedVolunteerId).map((t) => t.assignedVolunteerId)
    ).size,
  };

  return {
    ...disasterData,
    recentTasks: tasks.slice(0, 10),
    stats,
  };
}

/**
 * Update disaster
 */
export async function updateDisaster(id: string, input: UpdateDisasterInput) {
  const disaster = await prisma.disaster.findUnique({
    where: { id },
  });

  if (!disaster) {
    throw new Error('Disaster not found');
  }

  const updated = await prisma.disaster.update({
    where: { id },
    data: input,
  });

  return updated;
}

/**
 * Activate disaster (set status to ACTIVE)
 */
export async function activateDisaster(id: string, _activatedAt?: Date) {
  return await prisma.disaster.update({
    where: { id },
    data: { status: DisasterStatus.ACTIVE },
  });
}

/**
 * Resolve disaster (set status to RESOLVED)
 */
export async function resolveDisaster(id: string, _resolvedAt?: Date) {
  return await prisma.disaster.update({
    where: { id },
    data: {
      status: DisasterStatus.RESOLVED,
      endDate: new Date(),
    },
  });
}

/**
 * Archive disaster
 */
export async function archiveDisaster(id: string) {
  return await prisma.disaster.update({
    where: { id },
    data: { status: DisasterStatus.ARCHIVED },
  });
}

/**
 * Get active disasters (for dashboard)
 */
export async function getActiveDisasters() {
  return await prisma.disaster.findMany({
    where: { status: DisasterStatus.ACTIVE },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
    },
    orderBy: { startDate: 'desc' },
  });
}

/**
 * Get disaster statistics
 */
export async function getDisasterStats(id: string) {
  const [
    totalTasks,
    completedTasks,
    totalHours,
    activeVolunteers,
    recentCheckins,
  ] = await Promise.all([
    prisma.task.count({ where: { disasterId: id } }),
    prisma.task.count({ where: { disasterId: id, status: 'COMPLETED' } }),
    prisma.taskLog.aggregate({
      where: {
        task: { disasterId: id },
      },
      _sum: {
        hoursLogged: true,
      },
    }),
    prisma.task.findMany({
      where: { disasterId: id, assignedVolunteerId: { not: null } },
      select: { assignedVolunteerId: true },
      distinct: ['assignedVolunteerId'],
    }),
    prisma.wellnessCheckin.count({
      where: {
        volunteer: {
          assignedTasks: {
            some: {
              disasterId: id,
            },
          },
        },
        checkinDate: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  return {
    totalTasks,
    completedTasks,
    completionRate:
      totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : '0',
    totalHoursLogged: totalHours._sum.hoursLogged || 0,
    activeVolunteers: activeVolunteers.length,
    recentWellnessCheckins: recentCheckins,
  };
}
