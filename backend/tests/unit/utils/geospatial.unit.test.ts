
import {
  calculateDistance,
  distanceToScore,
  getGridCell,
  isWithinRadius,
  getDisasterRadius,
  estimateTravelTime,
  formatCoordinates,
  getBoundingBox,
  getCentroid,
} from '../../../src/shared/utils/geospatial';

describe('Geospatial Utilities', () => {
  describe('Distance Calculation', () => {
    // New York coordinates
    const nyLat = 40.7128;
    const nyLng = -74.0060;

    // Los Angeles coordinates
    const laLat = 34.0522;
    const laLng = -118.2437;

    it('should calculate distance between two points', () => {
      const distance = calculateDistance(nyLat, nyLng, laLat, laLng);
      expect(distance).toBeGreaterThan(3900); // ~3936km
      expect(distance).toBeLessThan(4100); // But less than 4100km
    });

    it('should return 0 for same point', () => {
      const distance = calculateDistance(nyLat, nyLng, nyLat, nyLng);
      expect(distance).toBe(0);
    });

    it('should be symmetric', () => {
      const distance1 = calculateDistance(nyLat, nyLng, laLat, laLng);
      const distance2 = calculateDistance(laLat, laLng, nyLat, nyLng);
      expect(distance1).toBeCloseTo(distance2, 2);
    });

    it('should handle negative coordinates', () => {
      const distance = calculateDistance(10, -5, -10, 5);
      expect(distance).toBeGreaterThan(0);
    });

    it('should handle near coordinates', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7130, -74.0062);
      expect(distance).toBeLessThan(1); // Less than 1 km
    });
  });

  describe('Distance to Score Conversion', () => {
    it('should return 100 for zero distance', () => {
      expect(distanceToScore(0)).toBe(100);
      expect(distanceToScore(0, 100)).toBe(100);
    });

    it('should return 0 for distance >= maxDistance', () => {
      expect(distanceToScore(50)).toBe(0);
      expect(distanceToScore(51)).toBe(0);
      expect(distanceToScore(100, 100)).toBe(0);
    });

    it('should return score linearly between 0 and 100', () => {
      expect(distanceToScore(25)).toBe(50); // Middle of 0-50km range
      expect(distanceToScore(10)).toBe(80); // 10/50 = 20% of range
    });

    it('should respect custom max distance', () => {
      expect(distanceToScore(5, 10)).toBe(50);
      expect(distanceToScore(10, 100)).toBe(90);
    });

    it('should handle negative distances as zero', () => {
      expect(distanceToScore(-10)).toBe(100);
    });
  });

  describe('Grid Cell Identification', () => {
    it('should return grid cell for coordinates', () => {
      const cell = getGridCell(17.385, 78.487);
      expect(cell).toBeDefined();
      expect(typeof cell).toBe('string');
      expect(cell).toMatch(/^[\d.-]+_[\d.-]+$/);
    });

    it('should group nearby points in same cell', () => {
      const cell1 = getGridCell(17.385, 78.487, 1);
      const cell2 = getGridCell(17.386, 78.488, 1);
      expect(cell1).toBe(cell2);
    });

    it('should separate distant points into different cells', () => {
      const cell1 = getGridCell(17.385, 78.487, 1);
      const cell2 = getGridCell(17.400, 78.500, 1);
      expect(cell1).not.toBe(cell2);
    });

    it('should respect custom cell size', () => {
      const cell1km = getGridCell(17.385, 78.487, 1);
      const cell2km = getGridCell(17.385, 78.487, 2);
      // Different cell sizes might produce different cells
      expect(cell1km).toBeDefined();
      expect(cell2km).toBeDefined();
    });

    it('should handle negative coordinates', () => {
      const cell = getGridCell(-40.7128, -74.0060, 1);
      expect(cell).toBeDefined();
    });
  });

  describe('Radius Check', () => {
    it('should return true for point within radius', () => {
      const result = isWithinRadius(40.7128, -74.0060, 40.7130, -74.0062, 1);
      expect(result).toBe(true);
    });

    it('should return false for point outside radius', () => {
      const result = isWithinRadius(40.7128, -74.0060, 42.0000, -74.0060, 1);
      expect(result).toBe(false);
    });

    it('should return true for point on radius boundary', () => {
      const centerLat = 40.7128;
      const centerLng = -74.0060;
      const pointLat = 40.7128;
      const pointLng = -74.0060;

      const result = isWithinRadius(pointLat, pointLng, centerLat, centerLng, 0);
      expect(result).toBe(true); // Exact center
    });
  });

  describe('Disaster Radius', () => {
    it('should return correct radius for LOW severity', () => {
      expect(getDisasterRadius('LOW')).toBe(2);
      expect(getDisasterRadius('low')).toBe(2);
    });

    it('should return correct radius for MEDIUM severity', () => {
      expect(getDisasterRadius('MEDIUM')).toBe(5);
    });

    it('should return correct radius for HIGH severity', () => {
      expect(getDisasterRadius('HIGH')).toBe(10);
    });

    it('should return correct radius for CRITICAL severity', () => {
      expect(getDisasterRadius('CRITICAL')).toBe(20);
    });

    it('should return default 5km for unknown severity', () => {
      expect(getDisasterRadius('UNKNOWN')).toBe(5);
      expect(getDisasterRadius('INVALID')).toBe(5);
    });
  });

  describe('Travel Time Estimation', () => {
    it('should calculate travel time', () => {
      const time = estimateTravelTime(40); // 40km
      expect(time).toBe(60); // 60 minutes at 40km/h
    });

    it('should round up to nearest minute', () => {
      const time = estimateTravelTime(5); // 5km at 40km/h = 7.5 minutes
      expect(time).toBe(8); // Rounded up
    });

    it('should handle zero distance', () => {
      const time = estimateTravelTime(0);
      expect(time).toBe(0);
    });

    it('should handle small distances', () => {
      const time = estimateTravelTime(1);
      expect(time).toBe(2); // ~1.5 minutes rounded up
    });

    it('should scale correctly with distance', () => {
      const time1 = estimateTravelTime(10);
      const time2 = estimateTravelTime(20);
      expect(time2).toBeGreaterThan(time1);
      expect(time2).toBeCloseTo(time1 * 2, 0);
    });
  });

  describe('Coordinate Formatting', () => {
    it('should format positive coordinates correctly', () => {
      const formatted = formatCoordinates(17.385, 78.487);
      expect(formatted).toBe('17.39°N, 78.49°E');
    });

    it('should format negative latitude correctly', () => {
      const formatted = formatCoordinates(-40.7128, 174.0060);
      expect(formatted).toMatch(/S/);
      expect(formatted).toMatch(/E/);
    });

    it('should format negative longitude correctly', () => {
      const formatted = formatCoordinates(40.7128, -74.0060);
      expect(formatted).toMatch(/N/);
      expect(formatted).toMatch(/W/);
    });

    it('should format both negative correctly', () => {
      const formatted = formatCoordinates(-40.7128, -74.0060);
      expect(formatted).toMatch(/S/);
      expect(formatted).toMatch(/W/);
    });

    it('should round to 2 decimal places', () => {
      const formatted = formatCoordinates(17.38567, 78.48923);
      expect(formatted).toBe('17.39°N, 78.49°E');
    });
  });

  describe('Bounding Box Calculation', () => {
    it('should calculate bounding box for coordinates', () => {
      const coords: [number, number][] = [
        [10, 20],
        [30, 40],
        [15, 25],
      ];
      const bbox = getBoundingBox(coords);
      expect(bbox).toEqual({
        minLat: 10,
        maxLat: 30,
        minLng: 20,
        maxLng: 40,
      });
    });

    it('should return null for empty array', () => {
      const bbox = getBoundingBox([]);
      expect(bbox).toBeNull();
    });

    it('should handle single point', () => {
      const coords: [number, number][] = [[17.385, 78.487]];
      const bbox = getBoundingBox(coords);
      expect(bbox).toEqual({
        minLat: 17.385,
        maxLat: 17.385,
        minLng: 78.487,
        maxLng: 78.487,
      });
    });

    it('should handle negative coordinates', () => {
      const coords: [number, number][] = [
        [-10, -20],
        [10, 20],
      ];
      const bbox = getBoundingBox(coords);
      expect(bbox).toEqual({
        minLat: -10,
        maxLat: 10,
        minLng: -20,
        maxLng: 20,
      });
    });
  });

  describe('Centroid Calculation', () => {
    it('should calculate centroid of coordinates', () => {
      const coords: [number, number][] = [
        [0, 0],
        [10, 10],
      ];
      const centroid = getCentroid(coords);
      expect(centroid).toEqual([5, 5]);
    });

    it('should return null for empty array', () => {
      const centroid = getCentroid([]);
      expect(centroid).toBeNull();
    });

    it('should handle single point', () => {
      const coords: [number, number][] = [[17.385, 78.487]];
      const centroid = getCentroid(coords);
      expect(centroid).toEqual([17.385, 78.487]);
    });

    it('should calculate centroid of multiple points', () => {
      const coords: [number, number][] = [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ];
      const centroid = getCentroid(coords);
      expect(centroid).toEqual([5, 5]);
    });

    it('should handle negative coordinates', () => {
      const coords: [number, number][] = [
        [-10, -10],
        [10, 10],
      ];
      const centroid = getCentroid(coords);
      expect(centroid).toEqual([0, 0]);
    });
  });
});
