export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  skills: string[];
  token: string;
  currentLat?: number;
  currentLon?: number;
  lastSyncAt?: string;
}

export interface LoginResponse {
  volunteer: {
    id: string;
    name: string;
    skills: string[];
  };
  accessToken: string;
}
