/**
 * Disaster type definitions
 */

export interface Disaster {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'ONGOING' | 'RESOLVED';
  affectedPopulation?: number;
}

export interface DisasterZone extends Disaster {
  radiusKm?: number;
}
