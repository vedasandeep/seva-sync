import { Prisma, TaskStatus, TaskUrgency } from '@prisma/client';
import { database as prisma } from '../../infrastructure/database';

export interface CreateTaskInput {
  disasterId: string;
  title: string;
  description?: string;
  requiredSkills?: string[];
  urgency: TaskUrgency;
  latitude: number;
  longitude: number;
  estimatedHours?: number;
  createdBy: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  requiredSkills?: string[];
  urgency?: TaskUrgency;
  latitude?: number;
  longitude?: number;
  estimatedHours?: number;
  status?: TaskStatus;
}

export interface TaskFilters {
  disasterId?: string;
  status?: TaskStatus;
  urgency?: TaskUrgency;
  assignedVolunteerId?: string;
  limit?: number;
  offset?: number;
}

export interface CompleteTaskInput {
  volunteerId: string;
  hoursLogged: number;
  notes?: string;
  gpsLat?: number;
  gpsLng?: number;
  proofMediaUrl?: string;
}

export class TaskService {
  /**
   * Create new task
   */
  async createTask(input: CreateTaskInput) {
    // Verify disaster exists
    const disaster = await prisma.disaster.findUnique({
      where: { id: input.disasterId },
    });

    if (!disaster) {
      throw new Error('Disaster not found');
    }

    if (disaster.status !== 'ACTIVE') {
      throw new Error('Cannot create tasks for inactive disasters');
    }

    const task = await prisma.task.create({
      data: {
        disasterId: input.disasterId,
        title: input.title,
        description: input.description,
        requiredSkills: input.requiredSkills || [],
        urgency: input.urgency,
        latitude: input.latitude,
        longitude: input.longitude,
        estimatedHours: input.estimatedHours,
        createdBy: input.createdBy,
        status: TaskStatus.OPEN,
      },
      include: {
        disaster: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return task;
  }

  /**
   * Get all tasks with filters
   */
  async listTasks(filters: TaskFilters = {}) {
    const {
      disasterId,
      status,
      urgency,
      assignedVolunteerId,
      limit = 50,
      offset = 0,
    } = filters;

    const where: Prisma.TaskWhereInput = {
      ...(disasterId && { disasterId }),
      ...(status && { status }),
      ...(urgency && { urgency }),
      ...(assignedVolunteerId && { assignedVolunteerId }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          disaster: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
            },
          },
          assignedVolunteer: {
            select: {
              id: true,
              name: true,
              skills: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get task by ID
   */
  async getTaskById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        disaster: true,
        assignedVolunteer: {
          select: {
            id: true,
            name: true,
            skills: true,
            currentLat: true,
            currentLng: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            role: true,
            organization: true,
          },
        },
        taskLogs: {
          include: {
            volunteer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    return task;
  }

  /**
   * Update task
   */
  async updateTask(id: string, input: UpdateTaskInput) {
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const updated = await prisma.task.update({
      where: { id },
      data: input,
      include: {
        disaster: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        assignedVolunteer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Assign task to volunteer
   */
  async assignTask(taskId: string, volunteerId: string) {
    // Use transaction with row locking to prevent double-assignment
    return await prisma.$transaction(async (tx) => {
      // Lock the task row
      const task = await tx.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      if (task.status !== TaskStatus.OPEN) {
        throw new Error(`Task is not available for assignment (status: ${task.status})`);
      }

      // Verify volunteer exists and is active
      const volunteer = await tx.volunteer.findUnique({
        where: { id: volunteerId },
      });

      if (!volunteer) {
        throw new Error('Volunteer not found');
      }

      if (!volunteer.isActive) {
        throw new Error('Volunteer is not active');
      }

      // Assign task
      const updated = await tx.task.update({
        where: { id: taskId },
        data: {
          assignedVolunteerId: volunteerId,
          status: TaskStatus.ASSIGNED,
          assignedAt: new Date(),
        },
        include: {
          assignedVolunteer: {
            select: {
              id: true,
              name: true,
              skills: true,
            },
          },
        },
      });

      return updated;
    });
  }

  /**
   * Start working on task (change status to IN_PROGRESS)
   */
  async startTask(taskId: string, volunteerId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.assignedVolunteerId !== volunteerId) {
      throw new Error('Task is not assigned to this volunteer');
    }

    if (task.status !== TaskStatus.ASSIGNED) {
      throw new Error(`Cannot start task with status: ${task.status}`);
    }

    return await prisma.task.update({
      where: { id: taskId },
      data: { status: TaskStatus.IN_PROGRESS },
    });
  }

  /**
   * Complete task and log hours
   */
  async completeTask(taskId: string, input: CompleteTaskInput) {
    return await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      if (task.assignedVolunteerId !== input.volunteerId) {
        throw new Error('Task is not assigned to this volunteer');
      }

      if (task.status === TaskStatus.COMPLETED) {
        throw new Error('Task is already completed');
      }

      // Create task log
      const taskLog = await tx.taskLog.create({
        data: {
          taskId,
          volunteerId: input.volunteerId,
          hoursLogged: input.hoursLogged,
          notes: input.notes,
          gpsLat: input.gpsLat,
          gpsLng: input.gpsLng,
          proofMediaUrl: input.proofMediaUrl,
          syncStatus: 'SYNCED',
          syncedAt: new Date(),
        },
      });

      // Update task status
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: {
          status: TaskStatus.COMPLETED,
          completedAt: new Date(),
        },
        include: {
          assignedVolunteer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        task: updatedTask,
        taskLog,
      };
    });
  }

  /**
   * Unassign task (return to OPEN status)
   */
  async unassignTask(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (!task.assignedVolunteerId) {
      throw new Error('Task is not assigned');
    }

    return await prisma.task.update({
      where: { id: taskId },
      data: {
        assignedVolunteerId: null,
        status: TaskStatus.OPEN,
        assignedAt: null,
      },
    });
  }

  /**
   * Cancel task
   */
  async cancelTask(taskId: string) {
    return await prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.CANCELLED,
      },
    });
  }

  /**
   * Get tasks near a location (for suggesting nearby tasks to volunteers)
   */
  async findNearbyTasks(
    lat: number,
    lng: number,
    radiusKm: number = 10,
    filters?: { status?: TaskStatus; urgency?: TaskUrgency }
  ) {
    const tasks = await prisma.$queryRaw<
      Array<{
        id: string;
        title: string;
        urgency: TaskUrgency;
        status: TaskStatus;
        required_skills: any;
        latitude: any;
        longitude: any;
        distance_km: number;
      }>
    >`
      SELECT 
        id, 
        title,
        urgency,
        status,
        required_skills,
        latitude,
        longitude,
        (
          6371 * acos(
            cos(radians(${lat})) * 
            cos(radians(latitude)) * 
            cos(radians(longitude) - radians(${lng})) + 
            sin(radians(${lat})) * 
            sin(radians(latitude))
          )
        ) as distance_km
      FROM tasks
      WHERE 
        status = ${filters?.status || TaskStatus.OPEN}
        AND (
          6371 * acos(
            cos(radians(${lat})) * 
            cos(radians(latitude)) * 
            cos(radians(longitude) - radians(${lng})) + 
            sin(radians(${lat})) * 
            sin(radians(latitude))
          )
        ) <= ${radiusKm}
      ORDER BY urgency DESC, distance_km ASC
      LIMIT 20
    `;

    return tasks;
  }

  /**
   * Get task statistics for a disaster
   */
  async getDisasterTaskStats(disasterId: string) {
    const [total, completed, assigned, inProgress, open] = await Promise.all([
      prisma.task.count({ where: { disasterId } }),
      prisma.task.count({ where: { disasterId, status: TaskStatus.COMPLETED } }),
      prisma.task.count({ where: { disasterId, status: TaskStatus.ASSIGNED } }),
      prisma.task.count({ where: { disasterId, status: TaskStatus.IN_PROGRESS } }),
      prisma.task.count({ where: { disasterId, status: TaskStatus.OPEN } }),
    ]);

    return {
      total,
      completed,
      assigned,
      inProgress,
      open,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : '0',
    };
  }
}

export default new TaskService();
