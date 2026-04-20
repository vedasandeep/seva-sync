/**
 * Disaster Heatmap Controller
 * 
 * Endpoints for accessing heatmap data and coverage analysis
 */

import { Router, Request, Response } from 'express';
import { generateVolunteerHeatmap, generateTaskDensityHeatmap } from './heatmap.service';
import { prisma } from '../../infrastructure/database';
import { calculateDistance, getDisasterRadius } from '../../shared/utils/geospatial';

const router = Router();

/**
 * GET /api/v1/disasters/:disasterId/heatmap
 * 
 * Generate and return volunteer density heatmap for a disaster
 * 
 * Query params:
 *   - gridSizeKm (optional): Size of grid cells (default: 1)
 *   - type (optional): 'volunteer', 'task', or 'both' (default: 'volunteer')
 * 
 * Returns GeoJSON FeatureCollection with heatmap cells
 */
router.get('/:disasterId/heatmap', async (req: Request, res: Response): Promise<void> => {
  try {
    const { disasterId } = req.params;
    const gridSizeKm = parseInt(req.query.gridSizeKm as string) || 1;
    const type = (req.query.type as string) || 'volunteer';

    if (gridSizeKm < 0.5 || gridSizeKm > 10) {
      res.status(400).json({ error: 'gridSizeKm must be between 0.5 and 10' });
      return;
    }

    let heatmapData;

    if (type === 'task') {
      heatmapData = await generateTaskDensityHeatmap(disasterId, gridSizeKm);
    } else if (type === 'both') {
      // Generate both and merge
      const volunteer = await generateVolunteerHeatmap(disasterId, gridSizeKm);
      const task = await generateTaskDensityHeatmap(disasterId, gridSizeKm);

      // Merge cells
      const cellMap = new Map();
      for (const cell of volunteer.cells) {
        cellMap.set(cell.gridId, cell);
      }
      for (const cell of task.cells) {
        const existing = cellMap.get(cell.gridId);
        if (existing) {
          existing.taskCount = cell.taskCount;
        } else {
          cellMap.set(cell.gridId, cell);
        }
      }

      heatmapData = {
        ...volunteer,
        cells: Array.from(cellMap.values()),
      };
    } else {
      heatmapData = await generateVolunteerHeatmap(disasterId, gridSizeKm);
    }

    // Convert to GeoJSON FeatureCollection
    const features = heatmapData.cells.map((cell) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [cell.centerLng, cell.centerLat], // GeoJSON uses [lng, lat]
      },
      properties: {
        gridId: cell.gridId,
        volunteerCount: cell.volunteerCount,
        taskCount: cell.taskCount,
        totalCount: cell.volunteerCount + cell.taskCount,
        avgBurnout: cell.avgBurnout,
        density: cell.density,
        skills: cell.skills,
      },
    }));

    const geojson = {
      type: 'FeatureCollection',
      properties: {
        disasterId,
        generatedAt: heatmapData.generatedAt,
        gridSizeKm: heatmapData.gridSizeKm,
        summary: heatmapData.summary,
      },
      features,
    };

    res.json(geojson);
  } catch (error) {
    console.error('Heatmap generation error:', error);
    res.status(500).json({ error: 'Failed to generate heatmap' });
  }
});

/**
 * GET /api/v1/disasters/:disasterId/coverage-analysis
 * 
 * Analyze volunteer coverage and identify gaps
 * 
 * Returns:
 *   - totalVolunteers: Count of volunteers nearby
 *   - coveragePercentage: % of disaster area covered
 *   - gapAreas: Locations with no volunteers nearby
 *   - zones: Geographic zones by coverage level
 */
router.get('/:disasterId/coverage-analysis', async (req: Request, res: Response): Promise<void> => {
  try {
    const { disasterId } = req.params;

    const disaster = await prisma.disaster.findUnique({
      where: { id: disasterId },
      select: { latitude: true, longitude: true, severity: true, name: true },
    });

    if (!disaster || !disaster.latitude || !disaster.longitude) {
      res.status(404).json({ error: 'Disaster not found' });
      return;
    }

    const disasterRadius = getDisasterRadius(disaster.severity);

    // Get volunteers in area
    const volunteers = await prisma.volunteer.findMany({
      where: { isActive: true, currentLat: { not: null }, currentLng: { not: null } },
      select: { id: true, currentLat: true, currentLng: true, burnoutScore: true },
    });

    const nearbyVolunteers = volunteers.filter((v) => {
      const distance = calculateDistance(
        parseFloat(v.currentLat!.toString()),
        parseFloat(v.currentLng!.toString()),
        parseFloat(disaster.latitude!.toString()),
        parseFloat(disaster.longitude!.toString())
      );
      return distance <= disasterRadius;
    });

    // Get tasks in area
    const tasks = await prisma.task.findMany({
      where: { disasterId, status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } },
      select: { id: true, latitude: true, longitude: true, urgency: true },
    });

    // Identify gaps (tasks with no volunteers nearby)
    const gapAreas = [];
    for (const task of tasks) {
      if (!task.latitude || !task.longitude) continue;

      const nearestVolunteer = nearbyVolunteers.reduce(
        (nearest, v) => {
          const distance = calculateDistance(
            parseFloat(v.currentLat!.toString()),
            parseFloat(v.currentLng!.toString()),
            parseFloat(task.latitude!.toString()),
            parseFloat(task.longitude!.toString())
          );
          if (!nearest || distance < nearest.distance) {
            return { volunteer: v, distance };
          }
          return nearest;
        },
        null as any
      );

      if (!nearestVolunteer || nearestVolunteer.distance > 5) {
        // Gap: no volunteer within 5km
        gapAreas.push({
          taskId: task.id,
          taskLocation: [parseFloat(task.latitude.toString()), parseFloat(task.longitude.toString())],
          taskUrgency: task.urgency,
          nearestVolunteerDistance: nearestVolunteer?.distance || disasterRadius,
        });
      }
    }

    // Calculate coverage percentage
    const coveredArea = Math.min(nearbyVolunteers.length * 25, Math.PI * disasterRadius * disasterRadius); // Rough estimate
    const totalArea = Math.PI * disasterRadius * disasterRadius;
    const coveragePercentage = Math.round((coveredArea / totalArea) * 100);

    // Categorize volunteers by coverage zones
    const zones = {
      highCoverage: nearbyVolunteers.filter((v) => {
        const distance = calculateDistance(
          parseFloat(v.currentLat!.toString()),
          parseFloat(v.currentLng!.toString()),
          parseFloat(disaster.latitude!.toString()),
          parseFloat(disaster.longitude!.toString())
        );
        return distance < 5;
      }).length,
      mediumCoverage: nearbyVolunteers.filter((v) => {
        const distance = calculateDistance(
          parseFloat(v.currentLat!.toString()),
          parseFloat(v.currentLng!.toString()),
          parseFloat(disaster.latitude!.toString()),
          parseFloat(disaster.longitude!.toString())
        );
        return distance >= 5 && distance < 15;
      }).length,
      lowCoverage: nearbyVolunteers.filter((v) => {
        const distance = calculateDistance(
          parseFloat(v.currentLat!.toString()),
          parseFloat(v.currentLng!.toString()),
          parseFloat(disaster.latitude!.toString()),
          parseFloat(disaster.longitude!.toString())
        );
        return distance >= 15 && distance <= disasterRadius;
      }).length,
    };

    // Calculate average burnout with proper Decimal handling
    let avgBurnout = 0;
    if (nearbyVolunteers.length > 0) {
      const totalBurnout = nearbyVolunteers.reduce(
        (sum, v) => sum + Number(v.burnoutScore),
        0
      );
      avgBurnout = Math.round((totalBurnout / nearbyVolunteers.length) * 10) / 10;
    }

    res.json({
      disasterId,
      disasterName: disaster.name,
      disasterRadius,
      totalVolunteers: nearbyVolunteers.length,
      totalTasks: tasks.length,
      coveragePercentage,
      avgVolunteerBurnout: avgBurnout,
      gapCount: gapAreas.length,
      gapAreas: gapAreas.slice(0, 20), // Limit to top 20 gaps
      zones,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Coverage analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze coverage' });
  }
});

export default router;
