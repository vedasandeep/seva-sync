import { prisma } from '../../infrastructure/database';

/**
 * IVR Analytics Service
 * Provides analytics and metrics for IVR calls and volunteer phone interactions
 */

export interface IVRAnalytics {
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
  missedCalls: number;
  successRate: number;
  avgCallDuration: number;
  callsByAction: Record<string, number>;
  callsByLanguage: Record<string, number>;
  callsByVolunteer: Array<{ volunteerId: string; name: string; calls: number }>;
}

export interface IVRCallLog {
  id: string;
  volunteerId?: string;
  volunteerName?: string;
  callSid: string;
  direction: 'INBOUND' | 'OUTBOUND';
  actionType: string;
  inputValue?: string;
  language: string;
  status: 'completed' | 'failed' | 'missed' | 'in_progress';
  duration?: number;
  createdAt: Date;
}

/**
 * Get IVR call statistics for dashboard
 */
export async function getIvrAnalytics(
  startDate?: Date,
  endDate?: Date
): Promise<IVRAnalytics> {
  try {
    const dateFilter: Record<string, any> = {};
    if (startDate || endDate) {
      dateFilter['createdAt'] = {};
      if (startDate) (dateFilter['createdAt'] as any)['gte'] = startDate;
      if (endDate) (dateFilter['createdAt'] as any)['lte'] = endDate;
    }

    // Get all IVR calls
    const calls = await prisma.iVRLog.findMany({
      where: dateFilter.createdAt ? { createdAt: dateFilter.createdAt } : {},
      include: {
        volunteer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate metrics
    const completed = calls.filter((c) => c.actionType && c.actionType !== 'error').length;
    const failed = calls.filter((c) => c.actionType === 'error' || c.actionType === 'auth_failed').length;
    const missed = calls.filter((c) => c.actionType === 'no_answer').length;
    const total = calls.length;

    // Calls by action type
    const callsByAction: Record<string, number> = {};
    calls.forEach((call) => {
      const action = call.actionType || 'unknown';
      callsByAction[action] = (callsByAction[action] || 0) + 1;
    });

    // Calls by language
    const callsByLanguage: Record<string, number> = {};
    calls.forEach((call) => {
      const lang = call.language || 'unknown';
      callsByLanguage[lang] = (callsByLanguage[lang] || 0) + 1;
    });

    // Calls by volunteer
    const volunteerMap = new Map<string, { name: string; count: number }>();
    calls.forEach((call) => {
      if (call.volunteer) {
        const key = call.volunteer.id;
        const current = volunteerMap.get(key) || { name: call.volunteer.name, count: 0 };
        current.count += 1;
        volunteerMap.set(key, current);
      }
    });

    const callsByVolunteer = Array.from(volunteerMap.entries())
      .map(([volunteerId, data]) => ({
        volunteerId,
        name: data.name,
        calls: data.count,
      }))
      .sort((a, b) => b.calls - a.calls);

    return {
      totalCalls: total,
      completedCalls: completed,
      failedCalls: failed,
      missedCalls: missed,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avgCallDuration: 0, // Not tracked yet in current schema
      callsByAction,
      callsByLanguage,
      callsByVolunteer,
    };
  } catch (error) {
    console.error('Error in getIvrAnalytics:', error);
    throw error;
  }
}

/**
 * Get recent IVR calls for history view
 */
export async function getRecentCalls(limit: number = 50): Promise<IVRCallLog[]> {
  try {
    const calls = await prisma.iVRLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        volunteer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return calls.map((call) => ({
      id: call.id,
      volunteerId: call.volunteerId || undefined,
      volunteerName: call.volunteer?.name,
      callSid: call.callSid,
      direction: call.direction,
      actionType: call.actionType,
      inputValue: call.inputValue || undefined,
      language: call.language,
      status: getCallStatus(call.actionType),
      createdAt: call.createdAt,
    }));
  } catch (error) {
    console.error('Error in getRecentCalls:', error);
    throw error;
  }
}

/**
 * Get calls by volunteer
 */
export async function getCallsByVolunteer(volunteerId: string): Promise<IVRCallLog[]> {
  try {
    const calls = await prisma.iVRLog.findMany({
      where: { volunteerId },
      orderBy: { createdAt: 'desc' },
      include: {
        volunteer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return calls.map((call) => ({
      id: call.id,
      volunteerId: call.volunteerId,
      volunteerName: call.volunteer?.name,
      callSid: call.callSid,
      direction: call.direction,
      actionType: call.actionType,
      inputValue: call.inputValue || undefined,
      language: call.language,
      status: getCallStatus(call.actionType),
      createdAt: call.createdAt,
    }));
  } catch (error) {
    console.error('Error in getCallsByVolunteer:', error);
    throw error;
  }
}

/**
 * Get IVR call statistics for specific time range
 */
export async function getCallStatistics(
  startDate: Date,
  endDate: Date
): Promise<{
  dailyCalls: Array<{ date: string; calls: number; completed: number }>;
  actionDistribution: Record<string, number>;
  languageDistribution: Record<string, number>;
}> {
  try {
    const calls = await prisma.iVRLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Group by day
    const dailyMap = new Map<string, { total: number; completed: number }>();
    calls.forEach((call) => {
      const date = call.createdAt.toISOString().split('T')[0];
      const current = dailyMap.get(date) || { total: 0, completed: 0 };
      current.total += 1;
      if (call.actionType && call.actionType !== 'error' && call.actionType !== 'auth_failed') {
        current.completed += 1;
      }
      dailyMap.set(date, current);
    });

    const dailyCalls = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        calls: data.total,
        completed: data.completed,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Action distribution
    const actionDistribution: Record<string, number> = {};
    calls.forEach((call) => {
      const action = call.actionType || 'unknown';
      actionDistribution[action] = (actionDistribution[action] || 0) + 1;
    });

    // Language distribution
    const languageDistribution: Record<string, number> = {};
    calls.forEach((call) => {
      const lang = call.language || 'unknown';
      languageDistribution[lang] = (languageDistribution[lang] || 0) + 1;
    });

    return {
      dailyCalls,
      actionDistribution,
      languageDistribution,
    };
  } catch (error) {
    console.error('Error in getCallStatistics:', error);
    throw error;
  }
}

/**
 * Helper function to determine call status from action type
 */
function getCallStatus(
  actionType: string
): 'completed' | 'failed' | 'missed' | 'in_progress' {
  if (!actionType) return 'in_progress';
  if (actionType === 'error' || actionType === 'auth_failed') return 'failed';
  if (actionType === 'no_answer') return 'missed';
  return 'completed';
}

/**
 * Get IVR adoption metrics
 */
export async function getAdoptionMetrics(): Promise<{
  totalVolunteers: number;
  ivrVolunteers: number;
  adoptionRate: number;
  recentAdoptions: Array<{ volunteerId: string; name: string; firstCall: Date }>;
}> {
  try {
    // Get total volunteers
    const totalVolunteers = await prisma.volunteer.count();

    // Get volunteers with IVR calls
    const volunteersWithCalls = await prisma.iVRLog.groupBy({
      by: ['volunteerId'],
      _count: true,
    });

    const ivrVolunteers = volunteersWithCalls.length;

    // Get recent adopters
    const recentAdoptions = await prisma.iVRLog.groupBy({
      by: ['volunteerId'],
      _min: {
        createdAt: true,
      },
      orderBy: {
        _min: {
          createdAt: 'desc',
        },
      },
      take: 10,
    });

    const adoptionDetails = await Promise.all(
      recentAdoptions.map(async (adoption) => {
        const volunteer = await prisma.volunteer.findUnique({
          where: { id: adoption.volunteerId },
          select: { id: true, name: true },
        });
        return {
          volunteerId: adoption.volunteerId,
          name: volunteer?.name || 'Unknown',
          firstCall: adoption._min.createdAt || new Date(),
        };
      })
    );

    return {
      totalVolunteers,
      ivrVolunteers,
      adoptionRate: totalVolunteers > 0 ? Math.round((ivrVolunteers / totalVolunteers) * 100) : 0,
      recentAdoptions: adoptionDetails,
    };
  } catch (error) {
    console.error('Error in getAdoptionMetrics:', error);
    throw error;
  }
}
