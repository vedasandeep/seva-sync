const API_BASE = '/api';

let token: string | null = localStorage.getItem('token');

export function setToken(t: string | null) {
  token = t;
  if (t) localStorage.setItem('token', t);
  else localStorage.removeItem('token');
}

export function getToken() {
  return token;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  // Backend returns { data: [...] }, { volunteers: [...] }, { tasks: [...] }, { disasters: [...] }, etc.
  // Extract the array from the response object
  return data.data ?? data.volunteers ?? data.tasks ?? data.disasters ?? data;
}

// Auth
export const auth = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; user: { id: string; name: string; role: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ id: string; name: string; email: string; role: string }>('/auth/me'),
};

// Disasters
export const disasters = {
  list: (params?: Record<string, string>) =>
    request<{ id: string; name: string; type: string; status: string; location: string; totalTasks?: number; completedTasks?: number; openTasks?: number }[]>(
      '/disasters' + (params ? '?' + new URLSearchParams(params) : '')
    ),
  get: (id: string) => request<Record<string, unknown>>(`/disasters/${id}`),
  create: (data: Record<string, unknown>) =>
    request('/disasters', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request(`/disasters/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  activate: (id: string) =>
    request(`/disasters/${id}/activate`, { method: 'POST', body: '{}' }),
  resolve: (id: string) =>
    request(`/disasters/${id}/resolve`, { method: 'POST', body: '{}' }),
  stats: (id: string) => request<Record<string, unknown>>(`/disasters/${id}/stats`),
};

// Tasks
export const tasks = {
  list: (params?: Record<string, string>) =>
    request<{ id: string; title: string; status: string; urgency: string; assignedVolunteerId?: string }[]>(
      '/tasks' + (params ? '?' + new URLSearchParams(params) : '')
    ),
  get: (id: string) => request<Record<string, unknown>>(`/tasks/${id}`),
  create: (data: Record<string, unknown>) =>
    request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  assign: (id: string, volunteerId: string) =>
    request(`/tasks/${id}/assign`, { method: 'POST', body: JSON.stringify({ volunteerId }) }),
  cancel: (id: string) =>
    request(`/tasks/${id}/cancel`, { method: 'POST', body: '{}' }),
};

// Volunteers
export const volunteers = {
  list: (params?: Record<string, string>) =>
    request<{ id: string; name: string; skills: string[]; isAvailable: boolean; currentLat?: number; currentLng?: number; burnoutScore: number }[]>(
      '/volunteers' + (params ? '?' + new URLSearchParams(params) : '')
    ),
  get: (id: string) => request<Record<string, unknown>>(`/volunteers/${id}`),
  nearby: (lat: number, lon: number, radiusKm: number) =>
    request<{ id: string; name: string; distanceKm: number }[]>(
      `/volunteers/nearby?latitude=${lat}&longitude=${lon}&radiusKm=${radiusKm}`
    ),
};
