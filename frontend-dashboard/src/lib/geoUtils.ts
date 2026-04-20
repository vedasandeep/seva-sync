/**
 * Frontend Geospatial Utilities
 * 
 * Client-side utilities for distance formatting, coordinate calculations,
 * and color coding for map visualizations.
 */

/**
 * Format distance in km to human-readable format
 * @param km - Distance in kilometers
 * @returns Formatted string ("500 m", "2.5 km", etc.)
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${(Math.round(km * 10) / 10).toFixed(1)} km`;
}

/**
 * Calculate distance between two points using Haversine formula
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
 * Get color for disaster severity level
 * Used for disaster markers
 */
export function getSeverityColor(severity: string): string {
  const colorMap: Record<string, string> = {
    LOW: '#3B82F6', // Blue
    MEDIUM: '#FBBF24', // Amber
    HIGH: '#FB923C', // Orange
    CRITICAL: '#EF4444', // Red
  };
  return colorMap[severity.toUpperCase()] || '#9CA3AF'; // Gray fallback
}

/**
 * Get color for task urgency level
 * Used for task markers
 */
export function getUrgencyColor(urgency: string): string {
  const colorMap: Record<string, string> = {
    LOW: '#60A5FA', // Light blue
    MEDIUM: '#FBBF24', // Amber
    HIGH: '#FB923C', // Orange
    CRITICAL: '#EF4444', // Red
  };
  return colorMap[urgency.toUpperCase()] || '#9CA3AF'; // Gray fallback
}

/**
 * Get color for volunteer burnout score
 * Green for healthy, yellow for warning, red for critical
 */
export function getBurnoutColor(score: number): string {
  if (score < 3) return '#10B981'; // Green (healthy)
  if (score < 5) return '#FBBF24'; // Yellow (caution)
  if (score < 7) return '#FB923C'; // Orange (warning)
  return '#EF4444'; // Red (critical)
}

/**
 * Get opacity/alpha for burnout color based on score
 * More severe = more opaque
 */
export function getBurnoutOpacity(score: number): number {
  if (score < 3) return 0.5;
  if (score < 5) return 0.6;
  if (score < 7) return 0.7;
  return 0.9;
}

/**
 * Get grid cell identifier for marker clustering
 * Divides map into cells for grouping nearby points
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
 * Estimate travel time between two points
 * Simplified: assumes ~40 km/h average in disaster areas
 */
export function estimateTravelTime(distanceKm: number): number {
  const averageSpeedKmH = 40;
  const minutesPerKm = 60 / averageSpeedKmH;
  return Math.ceil(distanceKm * minutesPerKm);
}

/**
 * Get dynamic radius for disaster impact zone
 */
export function getDisasterRadius(severity: string): number {
  const radiusMap: Record<string, number> = {
    LOW: 2,
    MEDIUM: 5,
    HIGH: 10,
    CRITICAL: 20,
  };
  return radiusMap[severity.toUpperCase()] || 5;
}

/**
 * Calculate bounds from coordinates array
 * Useful for auto-zoom/pan operations
 */
export function getBoundsFromCoordinates(
  coords: Array<[number, number]>
): { minLat: number; maxLat: number; minLng: number; maxLng: number } | null {
  if (coords.length === 0) return null;

  let minLat = coords[0][0];
  let maxLat = coords[0][0];
  let minLng = coords[0][1];
  let maxLng = coords[0][1];

  for (const [lat, lng] of coords) {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  }

  return { minLat, maxLat, minLng, maxLng };
}

/**
 * Get centroid of multiple coordinates
 */
export function getCentroid(coords: Array<[number, number]>): [number, number] | null {
  if (coords.length === 0) return null;

  const sum = coords.reduce(
    ([sumLat, sumLng], [lat, lng]) => [sumLat + lat, sumLng + lng],
    [0, 0]
  );

  return [sum[0] / coords.length, sum[1] / coords.length];
}

/**
 * Convert score (0-100) to star rating (0-5)
 * Used for matching score display
 */
export function scoreToStars(score: number): number {
  return Math.round((score / 100) * 5 * 2) / 2; // Round to nearest 0.5
}

/**
 * Get star display info (e.g., "★★★★☆")
 */
export function getStarDisplay(score: number): string {
  const stars = scoreToStars(score);
  const fullStars = Math.floor(stars);
  const hasHalf = stars % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  let display = '';
  for (let i = 0; i < fullStars; i++) display += '★';
  if (hasHalf) display += '½';
  for (let i = 0; i < emptyStars; i++) display += '☆';

  return display;
}

/**
 * Get detailed star breakdown for score
 */
export function getStarBreakdown(score: number): { full: number; half: boolean; empty: number } {
  const stars = scoreToStars(score);
  const fullStars = Math.floor(stars);
  const hasHalf = stars % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return {
    full: fullStars,
    half: hasHalf,
    empty: emptyStars,
  };
}

/**
 * Get HTML color for density level (heatmap)
 */
export function getDensityColor(density: 'low' | 'medium' | 'high' | 'critical'): string {
  const colorMap = {
    low: '#E5E7EB', // Light gray
    medium: '#86EFAC', // Light green
    high: '#22C55E', // Green
    critical: '#15803D', // Dark green
  };
  return colorMap[density];
}

/**
 * Get intensity for heatmap cells (0-1 scale)
 * Used for canvas/gradient rendering
 */
export function getHeatmapIntensity(count: number, maxCount: number): number {
  return Math.min(1, count / Math.max(maxCount, 1));
}
