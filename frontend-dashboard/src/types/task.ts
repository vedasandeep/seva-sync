/**
 * Task type definitions
 */

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  latitude: number;
  longitude: number;
  requiredSkills?: string[];
  location?: string;
  estimatedHours?: number;
}

export interface TaskLocation extends Task {
  distance?: number;
}
