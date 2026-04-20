/**
 * Disaster Heatmap Service
 * 
 * Generates grid-based heatmap data for visualizing volunteer and task density
 * within disaster impact zones.
 */

import { prisma } from '../../infrastructure/database';
import { getGridCell, calculateDistance, getDisasterRadius } from '../../shared/utils/geospatial';

export interface HeatmapCell {
  gridId: string;
  centerLat: number;
  centerLng: number;
  volunteerCount: number;
  taskCount: number;
  avgBurnout: number;
  skills: string[];
  density: 'low' | 'medium' | 'high' | 'critical';
}

export interface HeatmapData {
  disasterId: string;
  generatedAt: string;
  gridSizeKm: number;
  cells: HeatmapCell[];
  summary: {
    totalVolunteers: number;
    totalTasks: number;
    coveragePercentage: number;
    maxDensity: 'low' | 'medium' | 'high' | 'critical';
  };
}

/**
 * Generate volunteer density heatmap for a disaster
 * Returns grid-based aggregation of volunteer locations
 */
export async function generateVolunteerHeatmap(
  disasterId: string,
  gridSizeKm: number = 1
): Promise<HeatmapData> {
  // Get disaster location and severity
  const disaster = await prisma.disaster.findUnique({
    where: { id: disasterId },
    select: {
      latitude: true,
      longitude: true,
      severity: true,
    },
  });

  if (!disaster || !disaster.latitude || !disaster.longitude) {
    throw new Error(`Disaster ${disasterId} not found or missing location`);
  }

  const disasterRadius = getDisasterRadius(disaster.severity);

  // Get all volunteers within disaster radius
  const volunteers = await prisma.volunteer.findMany({
    where: {
      isActive: true,
      currentLat: { not: null },
      currentLng: { not: null },
    },
    select: {
      id: true,
      name: true,
      currentLat: true,
      currentLng: true,
      burnoutScore: true,
      skills: true,
    },
  });

  // Filter to only volunteers within disaster radius
  const nearbyVolunteers = volunteers.filter((v) => {
    const distance = calculateDistance(
      parseFloat(v.currentLat!.toString()),
      parseFloat(v.currentLng!.toString()),
      parseFloat(disaster.latitude!.toString()),
      parseFloat(disaster.longitude!.toString())
    );
    return distance <= disasterRadius;
  });

  // Group volunteers by grid cell
  const cellMap = new Map<string, any>();

  for (const volunteer of nearbyVolunteers) {
    const cellId = getGridCell(
      parseFloat(volunteer.currentLat!.toString()),
      parseFloat(volunteer.currentLng!.toString()),
      gridSizeKm
    );

    if (!cellMap.has(cellId)) {
      cellMap.set(cellId, {
        gridId: cellId,
        volunteers: [],
        tasks: [],
        skills: new Set<string>(),
      });
    }

    const cell = cellMap.get(cellId);
    cell.volunteers.push(volunteer);
    if (Array.isArray(volunteer.skills)) {
      for (const s of volunteer.skills as string[]) {
        cell.skills.add(s);
      }
    }
  }

  // Get tasks in same area
  const tasks = await prisma.task.findMany({
    where: {
      disasterId,
      status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] },
    },
    select: {
      id: true,
      latitude: true,
      longitude: true,
    },
  });

  for (const task of tasks) {
    if (task.latitude && task.longitude) {
      const cellId = getGridCell(
        parseFloat(task.latitude.toString()),
        parseFloat(task.longitude.toString()),
        gridSizeKm
      );

      if (!cellMap.has(cellId)) {
        cellMap.set(cellId, {
          gridId: cellId,
          volunteers: [],
          tasks: [],
          skills: new Set<string>(),
        });
      }

      cellMap.get(cellId).tasks.push(task);
    }
  }

  // Convert map to heatmap cells
  const cells: HeatmapCell[] = [];
  let maxDensity: number = 0;

  for (const [gridId, cell] of cellMap) {
    const [latStr, lngStr] = gridId.split('_');
    const centerLat = parseFloat(latStr);
    const centerLng = parseFloat(lngStr);

    const volunteerCount = cell.volunteers.length;
    const taskCount = cell.tasks.length;
    const avgBurnout =
      cell.volunteers.length > 0
        ? cell.volunteers.reduce((sum: number, v: any) => sum + v.burnoutScore, 0) /
          cell.volunteers.length
        : 0;

    const density = calculateDensity(volunteerCount, taskCount);
    const densityScore = volunteerCount + taskCount;
    maxDensity = Math.max(maxDensity, densityScore);

    cells.push({
      gridId,
      centerLat,
      centerLng,
      volunteerCount,
      taskCount,
      avgBurnout: Math.round(avgBurnout * 10) / 10,
      skills: Array.from(cell.skills),
      density,
    });
  }

  // Determine max density level
  let maxDensityLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (maxDensity >= 10) maxDensityLevel = 'critical';
  else if (maxDensity >= 6) maxDensityLevel = 'high';
  else if (maxDensity >= 3) maxDensityLevel = 'medium';

  // Calculate coverage percentage
  // Rough estimate: (area with volunteers) / (total disaster area) * 100
  const coveredArea = cellMap.size * (gridSizeKm * gridSizeKm);
  const totalArea = Math.PI * disasterRadius * disasterRadius;
  const coveragePercentage = Math.min(100, Math.round((coveredArea / totalArea) * 100));

  return {
    disasterId,
    generatedAt: new Date().toISOString(),
    gridSizeKm,
    cells,
    summary: {
      totalVolunteers: nearbyVolunteers.length,
      totalTasks: tasks.length,
      coveragePercentage,
      maxDensity: maxDensityLevel,
    },
  };
}

/**
 * Generate task density heatmap for a disaster
 * Shows clustering of open tasks
 */
export async function generateTaskDensityHeatmap(
  disasterId: string,
  gridSizeKm: number = 1
): Promise<HeatmapData> {
  const disaster = await prisma.disaster.findUnique({
    where: { id: disasterId },
    select: { latitude: true, longitude: true, severity: true },
  });

  if (!disaster || !disaster.latitude || !disaster.longitude) {
    throw new Error(`Disaster ${disasterId} not found or missing location`);
  }

  const disasterRadius = getDisasterRadius(disaster.severity);

  // Get all open/in-progress tasks
  const tasks = await prisma.task.findMany({
    where: {
      disasterId,
      status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] },
    },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      urgency: true,
      type: true,
    },
  });

  // Group tasks by grid cell
  const cellMap = new Map<string, any>();

  for (const task of tasks) {
    if (!task.latitude || !task.longitude) continue;

    const distance = calculateDistance(
      parseFloat(task.latitude.toString()),
      parseFloat(task.longitude.toString()),
      parseFloat(disaster.latitude!.toString()),
      parseFloat(disaster.longitude!.toString())
    );

    if (distance > disasterRadius) continue;

    const cellId = getGridCell(
      parseFloat(task.latitude.toString()),
      parseFloat(task.longitude.toString()),
      gridSizeKm
    );

    if (!cellMap.has(cellId)) {
      cellMap.set(cellId, {
        gridId: cellId,
        tasks: [],
        urgencies: new Set<string>(),
        types: new Set<string>(),
      });
    }

    const cell = cellMap.get(cellId);
    cell.tasks.push(task);
    cell.urgencies.add(task.urgency);
    cell.types.add(task.type);
  }

  // Convert to heatmap cells
  const cells: HeatmapCell[] = [];
  let maxDensity = 0;

  for (const [gridId, cell] of cellMap) {
    const [latStr, lngStr] = gridId.split('_');
    const taskCount = cell.tasks.length;
    maxDensity = Math.max(maxDensity, taskCount);

    const density = calculateDensity(0, taskCount);

    cells.push({
      gridId,
      centerLat: parseFloat(latStr),
      centerLng: parseFloat(lngStr),
      volunteerCount: 0,
      taskCount,
      avgBurnout: 0,
      skills: [], // Not applicable for task density
      density,
    });
  }

  let maxDensityLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (maxDensity >= 10) maxDensityLevel = 'critical';
  else if (maxDensity >= 6) maxDensityLevel = 'high';
  else if (maxDensity >= 3) maxDensityLevel = 'medium';

  return {
    disasterId,
    generatedAt: new Date().toISOString(),
    gridSizeKm,
    cells,
    summary: {
      totalVolunteers: 0,
      totalTasks: tasks.length,
      coveragePercentage: 0,
      maxDensity: maxDensityLevel,
    },
  };
}

/**
 * Calculate density level based on count
 */
function calculateDensity(
  volunteerCount: number,
  taskCount: number
): 'low' | 'medium' | 'high' | 'critical' {
  const totalCount = volunteerCount + taskCount;

  if (totalCount >= 10) return 'critical';
  if (totalCount >= 6) return 'high';
  if (totalCount >= 3) return 'medium';
  return 'low';
}
