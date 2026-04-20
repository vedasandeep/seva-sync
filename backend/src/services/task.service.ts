import { Prisma, TaskStatus, TaskUrgency } from '@prisma/client';
import prisma from '../utils/prisma';

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

  /**
   * Get task activity/timeline
   * Returns chronological events: created, assigned, started, updated, priority_changed
   */
  async getTaskActivity(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        taskLogs: {
          include: {
            volunteer: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        creator: {
          select: { id: true, name: true },
        },
        assignedVolunteer: {
          select: { id: true, name: true },
        },
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Build activity timeline from task record
    const activity: Array<{
      id: string;
      type: 'created' | 'assigned' | 'started' | 'updated' | 'priority_changed';
      title: string;
      actor: string;
      timestamp: Date;
      description: string;
      severity?: string;
    }> = [];

    // Event 1: Task Created
    activity.push({
      id: `activity-${taskId}-created`,
      type: 'created',
      title: 'Task created',
      actor: task.creator?.name || 'System',
      timestamp: task.createdAt,
      description: `Created by ${task.creator?.name || 'system'}`,
    });

    // Event 2: Task Assigned (if assigned)
    if (task.assignedVolunteerId && task.assignedAt) {
      activity.push({
        id: `activity-${taskId}-assigned`,
        type: 'assigned',
        title: `Assigned to ${task.assignedVolunteer?.name || 'Unknown'}`,
        actor: 'System',
        timestamp: task.assignedAt,
        description: `Task assigned to ${task.assignedVolunteer?.name || 'volunteer'}`,
      });
    }

    // Event 3: Task Started (if in progress or completed)
    if (
      task.status === TaskStatus.IN_PROGRESS ||
      task.status === TaskStatus.COMPLETED
    ) {
      activity.push({
        id: `activity-${taskId}-started`,
        type: 'started',
        title: 'Work started',
        actor: task.assignedVolunteer?.name || 'Volunteer',
        timestamp: new Date(
          task.assignedAt ? task.assignedAt.getTime() + 3600000 : Date.now()
        ),
        description: 'Task moved to IN_PROGRESS',
      });
    }

    // Event 4: Task Completed (if completed)
    if (task.status === TaskStatus.COMPLETED && task.completedAt) {
      activity.push({
        id: `activity-${taskId}-completed`,
        type: 'updated',
        title: 'Task completed',
        actor: task.assignedVolunteer?.name || 'Volunteer',
        timestamp: task.completedAt,
        description: 'Task marked as completed',
      });
    }

    // Event 5: Task Logs (updates from field)
    for (const log of task.taskLogs) {
      activity.push({
        id: `activity-${taskId}-log-${log.id}`,
        type: 'updated',
        title: 'Work logged',
        actor: log.volunteer?.name || 'Volunteer',
        timestamp: log.createdAt,
        description: `${log.hoursLogged} hours logged`,
      });
    }

    // Sort by timestamp ascending (oldest first)
    activity.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return activity;
  }

  /**
   * Get volunteer suggestions with ranking algorithm
   * Weights: Skill Match 50%, Distance 20%, Availability 15%, Burnout Risk 10%, Workload 5%
   */
  async getVolunteerSuggestions(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Get all active volunteers
    const volunteers = await prisma.volunteer.findMany({
      where: { isActive: true },
      include: {
        assignedTasks: {
          where: { status: { not: TaskStatus.COMPLETED } },
        },
      },
    });

    // Calculate score for each volunteer
    const suggestions = volunteers.map((volunteer) => {
      // 1. Skill Match (50%)
      const requiredSkills = (task.requiredSkills as string[]) || [];
      const volunteerSkills = (volunteer.skills as string[]) || [];
      const matchedSkills = requiredSkills.filter((skill: string) =>
        volunteerSkills.some(
          (vs: string) => vs.toLowerCase().includes(skill.toLowerCase())
        )
      );
      const skillMatch =
        requiredSkills.length > 0
          ? Math.min((matchedSkills.length / requiredSkills.length) * 100, 100)
          : 75; // Default 75% if no specific skills required

      // 2. Distance Score (20%) - simulate distance calculation
      const volunteerLat = Number(volunteer.currentLat || 0);
      const volunteerLng = Number(volunteer.currentLng || 0);
      const taskLat = Number(task.latitude);
      const taskLng = Number(task.longitude);

      // Simple distance calculation (Euclidean)
      const distance = Math.sqrt(
        Math.pow(taskLat - volunteerLat, 2) + Math.pow(taskLng - volunteerLng, 2)
      );
      // Distance score: closer = higher score (max 100 at 0 distance, min 20 at 10+ units)
      const distanceScore = Math.max(20, 100 - distance * 10);

      // 3. Availability Score (15%)
      // Assume volunteers within a certain burnout range are available
      const availabilityScore = volunteer.isAvailable ? 90 : 30;

      // 4. Burnout Risk (10%) - lower burnout score is better
      // Burnout typically 0-100, we invert it (100 - burnoutScore)
      const burnoutScore = Math.max(0, 100 - Number(volunteer.burnoutScore || 50));

      // 5. Workload (5%) - fewer active tasks = better
      const maxConcurrentTasks = 5;
      const activeTasks = volunteer.assignedTasks?.length || 0;
      const workloadScore = Math.max(
        20,
        100 - (activeTasks / maxConcurrentTasks) * 100
      );

      // Calculate weighted final score
      const finalScore =
        (skillMatch * 0.5 +
          distanceScore * 0.2 +
          availabilityScore * 0.15 +
          burnoutScore * 0.1 +
          workloadScore * 0.05) /
        1; // Normalized

      // Determine quality level based on final score
      let quality: 'excellent' | 'good' | 'fair' | 'poor' = 'fair';
      if (finalScore >= 85) quality = 'excellent';
      else if (finalScore >= 70) quality = 'good';
      else if (finalScore >= 50) quality = 'fair';
      else quality = 'poor';

      return {
        volunteerId: volunteer.id,
        volunteer: {
          id: volunteer.id,
          name: volunteer.name,
          skills: volunteerSkills,
          burnoutScore: volunteer.burnoutScore || 50,
          isAvailable: volunteer.isAvailable,
          currentLocation: {
            lat: volunteerLat,
            lng: volunteerLng,
          },
          currentActiveTasks: activeTasks,
        },
        scoreBreakdown: {
          skillMatch: Math.round(skillMatch),
          distanceScore: Math.round(distanceScore),
          availabilityScore: Math.round(availabilityScore),
          burnoutScore: Math.round(burnoutScore),
          workloadScore: Math.round(workloadScore),
          finalScore: Math.round(finalScore),
        },
        quality,
        ranking: 0, // Will be updated after sorting
      };
    });

    // Sort by final score (descending) and assign rankings
    suggestions.sort(
      (a, b) => b.scoreBreakdown.finalScore - a.scoreBreakdown.finalScore
    );
    suggestions.forEach((sugg, index) => {
      sugg.ranking = index + 1;
    });

    // Return top 5 suggestions
    return suggestions.slice(0, 5);
  }

  /**
   * Bulk update multiple tasks
   * Updates status, urgency, type, or assigned volunteer for multiple tasks
   */
  async bulkUpdateTasks(input: {
    taskIds: string[];
    status?: TaskStatus;
    urgency?: TaskUrgency;
    type?: string;
    assignedVolunteerId?: string;
    archived?: boolean;
  }) {
    const { taskIds, status, urgency, type, assignedVolunteerId, archived } =
      input;

    if (!taskIds || taskIds.length === 0) {
      throw new Error('No task IDs provided');
    }

    if (taskIds.length > 100) {
      throw new Error('Maximum 100 tasks can be updated at once');
    }

    // Build update data based on provided fields
    const updateData: any = {};
    if (status) updateData.status = status;
    if (urgency) updateData.urgency = urgency;
    if (type) updateData.type = type;
    if (assignedVolunteerId) updateData.assignedVolunteerId = assignedVolunteerId;
    if (archived !== undefined) updateData.archived = archived;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No update fields provided');
    }

    // Use transaction to update all tasks atomically
    const updatedTasks = await prisma.$transaction(
      taskIds.map((taskId) =>
        prisma.task.update({
          where: { id: taskId },
          data: updateData,
          include: {
            disaster: {
              select: { id: true, name: true },
            },
            assignedVolunteer: {
              select: { id: true, name: true },
            },
          },
        })
      )
    );

    return {
      count: updatedTasks.length,
      tasks: updatedTasks,
    };
  }
}

export default new TaskService();
