import { prisma } from '../utils/prisma';
import { hashPhone } from '../utils/crypto';
import { TaskStatus, CallDirection } from '@prisma/client';

/**
 * IVR Service - Core business logic for phone-based interactions
 * MVP: Auth by phone, get nearest task, accept/complete task
 */

/**
 * Authenticate volunteer by phone number
 * Returns volunteer if found, null otherwise
 */
export async function authenticateByPhone(phoneNumber: string) {
  const phoneHash = hashPhone(phoneNumber);
  
  const volunteer = await prisma.volunteer.findUnique({
    where: { phoneHash },
    select: {
      id: true,
      name: true,
      isAvailable: true,
      currentLat: true,
      currentLng: true,
      language: true,
    },
  });
  
  return volunteer;
}

/**
 * Get volunteer's current active task (if any)
 */
export async function getActiveTask(volunteerId: string) {
  const task = await prisma.task.findFirst({
    where: {
      assignedVolunteerId: volunteerId,
      status: TaskStatus.IN_PROGRESS,
    },
    select: {
      id: true,
      title: true,
      description: true,
      urgency: true,
      estimatedHours: true,
      latitude: true,
      longitude: true,
      disaster: {
        select: {
          name: true,
        },
      },
    },
  });
  
  return task;
}

/**
 * Get nearest available task for volunteer
 * Uses Haversine formula for distance calculation
 */
export async function getNearestTask(volunteerId: string, lat?: number, lng?: number) {
  // Get volunteer's location if not provided
  if (!lat || !lng) {
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
      select: { currentLat: true, currentLng: true },
    });
    lat = volunteer?.currentLat ? Number(volunteer.currentLat) : undefined;
    lng = volunteer?.currentLng ? Number(volunteer.currentLng) : undefined;
  }
  
  // If still no location, get any open task
  if (!lat || !lng) {
    return prisma.task.findFirst({
      where: {
        status: TaskStatus.OPEN,
        assignedVolunteerId: null,
      },
      orderBy: { urgency: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        urgency: true,
        estimatedHours: true,
        latitude: true,
        longitude: true,
        disaster: {
          select: { name: true },
        },
      },
    });
  }
  
  // Find nearest task using raw SQL with Haversine
  const tasks = await prisma.$queryRaw<Array<{
    id: string;
    title: string;
    description: string | null;
    urgency: string;
    estimated_hours: number | null;
    latitude: number;
    longitude: number;
    distance_km: number;
  }>>`
    SELECT 
      t.id,
      t.title,
      t.description,
      t.urgency,
      t.estimated_hours,
      t.latitude,
      t.longitude,
      (6371 * acos(
        cos(radians(${lat})) * cos(radians(t.latitude)) *
        cos(radians(t.longitude) - radians(${lng})) +
        sin(radians(${lat})) * sin(radians(t.latitude))
      )) as distance_km
    FROM tasks t
    WHERE t.status = 'OPEN'
      AND t.assigned_volunteer_id IS NULL
      AND t.latitude IS NOT NULL
      AND t.longitude IS NOT NULL
    ORDER BY distance_km ASC
    LIMIT 1
  `;
  
  if (!tasks[0]) return null;
  
  // Normalize to match the regular query format
  return {
    id: tasks[0].id,
    title: tasks[0].title,
    description: tasks[0].description,
    urgency: tasks[0].urgency,
    estimatedHours: tasks[0].estimated_hours,
    latitude: tasks[0].latitude,
    longitude: tasks[0].longitude,
  };
}

/**
 * Accept task via IVR - assigns task to volunteer
 */
export async function acceptTaskViaIvr(taskId: string, volunteerId: string) {
  // Use transaction with optimistic locking
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({
      where: { id: taskId },
    });
    
    if (!task || task.status !== TaskStatus.OPEN || task.assignedVolunteerId) {
      throw new Error('Task not available');
    }
    
    // Update task
    const updated = await tx.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.IN_PROGRESS,
        assignedVolunteerId: volunteerId,
        assignedAt: new Date(),
        currentVolunteers: task.currentVolunteers + 1,
      },
    });
    
    // Log the action
    await tx.taskLog.create({
      data: {
        taskId,
        volunteerId,
        action: 'Task accepted via IVR',
        hoursLogged: 0,
      },
    });
    
    return updated;
  });
}

/**
 * Complete task via IVR
 */
export async function completeTaskViaIvr(taskId: string, volunteerId: string) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({
      where: { id: taskId },
    });
    
    if (!task || task.assignedVolunteerId !== volunteerId) {
      throw new Error('Task not found or not assigned to you');
    }
    
    if (task.status === TaskStatus.COMPLETED) {
      throw new Error('Task already completed');
    }
    
    // Update task
    const updated = await tx.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
    
    // Update volunteer stats
    await tx.volunteer.update({
      where: { id: volunteerId },
      data: {
        totalTasksCompleted: { increment: 1 },
        lastActiveAt: new Date(),
      },
    });
    
    // Log the action
    await tx.taskLog.create({
      data: {
        taskId,
        volunteerId,
        action: 'Task completed via IVR',
        hoursLogged: 0,
      },
    });
    
    return updated;
  });
}

/**
 * Log IVR call to database
 * Flexible interface to handle different call scenarios
 */
export async function logIvrCall(data: {
  volunteerId?: string;
  callSid: string;
  direction: 'inbound' | 'outbound' | 'INBOUND' | 'OUTBOUND';
  phoneNumber?: string;
  action: string;
  success: boolean;
  durationSeconds?: number;
  errorMessage?: string;
}) {
  // Skip logging if no volunteerId (can't link to volunteer)
  if (!data.volunteerId) {
    console.log(`[IVR] Call log skipped (no volunteer): ${data.callSid} - ${data.action}`);
    return null;
  }
  
  const direction = data.direction.toUpperCase() as CallDirection;
  
  return prisma.iVRLog.create({
    data: {
      volunteerId: data.volunteerId,
      callSid: data.callSid,
      direction,
      actionType: data.action,
      inputValue: data.errorMessage || (data.success ? 'success' : 'failed'),
      language: 'hi', // Default to Hindi
    },
  });
}

/**
 * Update volunteer's last active timestamp
 */
export async function updateVolunteerActivity(volunteerId: string) {
  return prisma.volunteer.update({
    where: { id: volunteerId },
    data: { lastActiveAt: new Date() },
  });
}
