export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TaskResponse {
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    urgency: string;
    description?: string;
    latitude?: number;
    longitude?: number;
  }>;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface NearbyTaskResponse {
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    urgency: string;
    description?: string;
    distanceKm: number;
  }>;
}
