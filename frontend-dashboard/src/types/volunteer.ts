/**
 * Volunteer type definitions
 */

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  currentLat: number;
  currentLng: number;
  availabilityRadiusKm?: number;
  burnoutScore: number;
  matchScore?: number;
  skills?: string[];
}

export interface VolunteerLocation extends Volunteer {
  distance?: number;
}
