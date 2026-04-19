import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

export interface UpdateVolunteerInput {
  name?: string;
  language?: string;
  skills?: string[];
  availabilityRadiusKm?: number;
  currentLat?: number;
  currentLng?: number;
}

export interface WellnessCheckinInput {
  feeling: string;
  sentimentScore?: number;
  voiceNoteUrl?: string;
}

export interface VolunteerFilters {
  isActive?: boolean;
  skills?: string[];
  minBurnoutScore?: number;
  maxBurnoutScore?: number;
  language?: string;
  limit?: number;
  offset?: number;
}

export class VolunteerService {
  /**
   * Get all volunteers with optional filters
   */
  async listVolunteers(filters: VolunteerFilters = {}) {
    const {
      isActive = true,
      skills,
      minBurnoutScore,
      maxBurnoutScore,
      language,
      limit = 50,
      offset = 0,
    } = filters;

    const where: Prisma.VolunteerWhereInput = {
      isActive,
      ...(language && { language }),
      ...(minBurnoutScore !== undefined && { burnoutScore: { gte: minBurnoutScore } }),
      ...(maxBurnoutScore !== undefined && { burnoutScore: { lte: maxBurnoutScore } }),
      ...(skills && skills.length > 0 && {
        skills: {
          path: [],
          array_contains: skills,
        },
      }),
    };

    const [volunteers, total] = await Promise.all([
      prisma.volunteer.findMany({
        where,
        select: {
          id: true,
          name: true,
          language: true,
          skills: true,
          availabilityRadiusKm: true,
          currentLat: true,
          currentLng: true,
          burnoutScore: true,
          lastCheckin: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.volunteer.count({ where }),
    ]);

    return {
      volunteers,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get volunteer by ID
   */
  async getVolunteerById(id: string) {
    const volunteer = await prisma.volunteer.findUnique({
      where: { id },
      include: {
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            urgency: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        taskLogs: {
          select: {
            id: true,
            hoursLogged: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        wellnessCheckins: {
          select: {
            id: true,
            feeling: true,
            sentimentScore: true,
            checkinDate: true,
          },
          orderBy: { checkinDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!volunteer) {
      throw new Error('Volunteer not found');
    }

    // Return without exposing encrypted phone
    const { phoneEncrypted, phoneHash, ...volunteerData } = volunteer;

    return volunteerData;
  }

  /**
   * Update volunteer profile
   */
  async updateVolunteer(id: string, input: UpdateVolunteerInput) {
    const volunteer = await prisma.volunteer.findUnique({
      where: { id },
    });

    if (!volunteer) {
      throw new Error('Volunteer not found');
    }

    const updated = await prisma.volunteer.update({
      where: { id },
      data: {
        ...input,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        language: true,
        skills: true,
        availabilityRadiusKm: true,
        currentLat: true,
        currentLng: true,
        burnoutScore: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Update volunteer location (GPS)
   */
  async updateLocation(id: string, lat: number, lng: number) {
    return await prisma.volunteer.update({
      where: { id },
      data: {
        currentLat: lat,
        currentLng: lng,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        currentLat: true,
        currentLng: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Submit wellness check-in
   */
  async submitWellnessCheckin(volunteerId: string, input: WellnessCheckinInput) {
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
    });

    if (!volunteer) {
      throw new Error('Volunteer not found');
    }

    const checkin = await prisma.wellnessCheckin.create({
      data: {
        volunteerId,
        checkinDate: new Date(),
        feeling: input.feeling,
        sentimentScore: input.sentimentScore,
        voiceNoteUrl: input.voiceNoteUrl,
      },
    });

    // Update volunteer's last check-in timestamp
    await prisma.volunteer.update({
      where: { id: volunteerId },
      data: { lastCheckin: new Date() },
    });

    return checkin;
  }

  /**
   * Get volunteer wellness history
   */
  async getWellnessHistory(volunteerId: string, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const checkins = await prisma.wellnessCheckin.findMany({
      where: {
        volunteerId,
        checkinDate: { gte: since },
      },
      orderBy: { checkinDate: 'desc' },
    });

    return checkins;
  }

  /**
   * Get volunteer task history
   */
  async getTaskHistory(volunteerId: string, limit: number = 50) {
    const taskLogs = await prisma.taskLog.findMany({
      where: { volunteerId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            urgency: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return taskLogs;
  }

  /**
   * Get volunteers near a location (geospatial query)
   */
  async findNearbyVolunteers(
    lat: number,
    lng: number,
    radiusKm: number = 10,
    filters?: { skills?: string[]; isActive?: boolean }
  ) {
    // Using Haversine formula in SQL
    // Note: For production, use PostGIS extension for better performance
    const volunteers = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        skills: any;
        currentLat: any;
        currentLng: any;
        distance_km: number;
      }>
    >`
      SELECT 
        id, 
        name, 
        skills,
        current_lat as "currentLat",
        current_lng as "currentLng",
        (
          6371 * acos(
            cos(radians(${lat})) * 
            cos(radians(current_lat)) * 
            cos(radians(current_lng) - radians(${lng})) + 
            sin(radians(${lat})) * 
            sin(radians(current_lat))
          )
        ) as distance_km
      FROM volunteers
      WHERE 
        is_active = ${filters?.isActive !== false}
        AND current_lat IS NOT NULL
        AND current_lng IS NOT NULL
        AND (
          6371 * acos(
            cos(radians(${lat})) * 
            cos(radians(current_lat)) * 
            cos(radians(current_lng) - radians(${lng})) + 
            sin(radians(${lat})) * 
            sin(radians(current_lat))
          )
        ) <= ${radiusKm}
      ORDER BY distance_km ASC
      LIMIT 50
    `;

    // Filter by skills if provided
    if (filters?.skills && filters.skills.length > 0) {
      return volunteers.filter((v) => {
        const volunteerSkills = Array.isArray(v.skills) ? v.skills : [];
        return filters.skills!.some((skill) => volunteerSkills.includes(skill));
      });
    }

    return volunteers;
  }

  /**
   * Deactivate volunteer (soft delete)
   */
  async deactivateVolunteer(id: string) {
    return await prisma.volunteer.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Reactivate volunteer
   */
  async reactivateVolunteer(id: string) {
    return await prisma.volunteer.update({
      where: { id },
      data: { isActive: true },
    });
  }

  /**
   * Get volunteer statistics
   */
  async getVolunteerStats(volunteerId: string) {
    const [totalTasks, totalHours, recentCheckins] = await Promise.all([
      prisma.task.count({
        where: {
          assignedVolunteerId: volunteerId,
          status: 'COMPLETED',
        },
      }),
      prisma.taskLog.aggregate({
        where: { volunteerId },
        _sum: { hoursLogged: true },
      }),
      prisma.wellnessCheckin.count({
        where: {
          volunteerId,
          checkinDate: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    return {
      totalTasksCompleted: totalTasks,
      totalHoursLogged: totalHours._sum.hoursLogged || 0,
      recentCheckins,
    };
  }
}

export default new VolunteerService();
