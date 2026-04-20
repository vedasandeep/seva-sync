/**
 * Geospatial Utility Functions
 * 
 * Shared utilities for distance calculations, grid-based clustering,
 * and location-based operations across the backend.
 */

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 * 
 * @param lat1 - Starting latitude
 * @param lon1 - Starting longitude
 * @param lat2 - Ending latitude
 * @param lon2 - Ending longitude
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert distance to a 0-100 score
 * 0km = 100, maxDistanceKm+ = 0 (linear decay)
 * 
 * Used by matching algorithm and heatmap intensity calculation
 * 
 * @param distanceKm - Distance in kilometers
 * @param maxDistanceKm - Distance at which score reaches 0 (default: 50km)
 * @returns Score from 0-100
 */
export function distanceToScore(distanceKm: number, maxDistanceKm: number = 50): number {
  if (distanceKm <= 0) return 100;
  if (distanceKm >= maxDistanceKm) return 0;
  return 100 * (1 - distanceKm / maxDistanceKm);
}

/**
 * Get grid cell identifier for geographic clustering
 * Divides map into cells for grouping nearby points
 * 
 * @param lat - Latitude
 * @param lng - Longitude
 * @param cellSizeKm - Size of each grid cell in kilometers (default: 1km)
 * @returns Grid cell identifier (e.g., "17.38_78.48")
 * 
 * @example
 * getGridCell(17.385, 78.487, 1) // Returns "17.38_78.48"
 * getGridCell(17.385, 78.487, 2) // Returns "17.38_78.48" (2km grid)
 */
export function getGridCell(lat: number, lng: number, cellSizeKm: number = 1): string {
  // Approximate degrees per km at equator (1 km ≈ 0.009 degrees)
  const degreesPerKm = 1 / 111.32;
  const cellDegrees = cellSizeKm * degreesPerKm;
  
  const cellLat = Math.floor(lat / cellDegrees) * cellDegrees;
  const cellLng = Math.floor(lng / cellDegrees) * cellDegrees;
  
  return `${cellLat.toFixed(2)}_${cellLng.toFixed(2)}`;
}

/**
 * Check if a point is within radius of center
 * 
 * @param pointLat - Point latitude
 * @param pointLng - Point longitude
 * @param centerLat - Center latitude
 * @param centerLng - Center longitude
 * @param radiusKm - Radius in kilometers
 * @returns true if point is within radius
 */
export function isWithinRadius(
  pointLat: number,
  pointLng: number,
  centerLat: number,
  centerLng: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(pointLat, pointLng, centerLat, centerLng);
  return distance <= radiusKm;
}

/**
 * Get dynamic radius for disaster impact zone based on severity
 * 
 * @param severity - Disaster severity level
 * @returns Radius in kilometers
 */
export function getDisasterRadius(severity: string): number {
  const radiusMap: Record<string, number> = {
    LOW: 2,
    MEDIUM: 5,
    HIGH: 10,
    CRITICAL: 20,
  };
  
  return radiusMap[severity.toUpperCase()] || 5; // Default to 5km
}

/**
 * Estimate travel time between two points
 * Simplified calculation: assumes ~40 km/h average speed in disaster areas
 * 
 * @param distanceKm - Distance in kilometers
 * @returns Estimated travel time in minutes
 */
export function estimateTravelTime(distanceKm: number): number {
  const averageSpeedKmH = 40; // Conservative estimate for disaster/rural areas
  const minutesPerKm = 60 / averageSpeedKmH;
  return Math.ceil(distanceKm * minutesPerKm);
}

/**
 * Convert decimal degrees to human-readable format
 * 
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Formatted coordinates (e.g., "17.38°N, 78.49°E")
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lng).toFixed(2)}°${lngDir}`;
}

/**
 * Calculate bounding box for a set of coordinates
 * Useful for map zoom/pan operations
 * 
 * @param coordinates - Array of [lat, lng] tuples
 * @returns Object with min/max bounds {minLat, maxLat, minLng, maxLng}
 */
export function getBoundingBox(
  coordinates: Array<[number, number]>
): { minLat: number; maxLat: number; minLng: number; maxLng: number } | null {
  if (coordinates.length === 0) return null;
  
  let minLat = coordinates[0][0];
  let maxLat = coordinates[0][0];
  let minLng = coordinates[0][1];
  let maxLng = coordinates[0][1];
  
  for (const [lat, lng] of coordinates) {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  }
  
  return { minLat, maxLat, minLng, maxLng };
}

/**
 * Calculate center point (centroid) of multiple coordinates
 * 
 * @param coordinates - Array of [lat, lng] tuples
 * @returns Center point [lat, lng]
 */
export function getCentroid(coordinates: Array<[number, number]>): [number, number] | null {
  if (coordinates.length === 0) return null;
  
  const sum = coordinates.reduce(
    ([sumLat, sumLng], [lat, lng]) => [sumLat + lat, sumLng + lng],
    [0, 0]
  );
  
  return [sum[0] / coordinates.length, sum[1] / coordinates.length];
}
