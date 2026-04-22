# Frontend Map Capabilities Analysis - Day 5

## Executive Summary

The frontend is **well-prepared** for implementing map functionality on Day 5. Both frontend applications have the necessary libraries installed and rich mock data with geographic coordinates. No additional dependencies need to be installed.

---

## 1. Map Libraries Installed

### Frontend-Dashboard
**Package.json Dependencies:**
```json
"leaflet": "^1.9.4",
"react-leaflet": "^4.2.1",
"@types/leaflet": "^1.9.12"
```
- ✅ **Leaflet**: Open-source JavaScript map library (OSM support)
- ✅ **React-Leaflet**: React wrapper for Leaflet with component-based API
- ✅ **Type definitions**: Full TypeScript support

**Dev Dependencies:**
- React 18.3.1, TypeScript 5.5.4, Tailwind CSS 4.2.2
- Testing: Vitest, React Testing Library

### Frontend-PWA
**Current Dependencies:**
- ❌ **NO** map libraries installed
- **Has**: React Router, IDB (IndexedDB), Zustand state management
- **Has**: Offline support infrastructure ready

**Action for Day 5**: PWA will need map libraries added (`npm install leaflet react-leaflet @types/leaflet`)

---

## 2. Existing Map Components

### Current Status
- ✅ **Dashboard**: NO existing map components (blank canvas)
- ✅ **PWA**: NO existing map components (blank canvas)
- Both ready for new map implementation
- Location/Map icons imported from lucide-react in several pages

**Example Icon Usage:**
```typescript
import { MapPin, ArrowLeft, Calendar } from 'lucide-react';
```

---

## 3. Mock Data for Geographic Locations

### Disasters with Coordinates
Location data in `frontend-dashboard/src/lib/mockData.ts`:

```typescript
// Example from DisasterDetailPage.tsx
MOCK_DISASTER_DETAIL = {
  location: 'Hyderabad, Telangana',
  latitude: 17.3850,
  longitude: 78.4867,
  ...
}

// DisastersPage.tsx includes:
[
  { location: 'Hyderabad, Telangana', latitude: 17.385 },
  { location: 'Chennai, Tamil Nadu', latitude: 13.0827 },
  { location: 'New Delhi, Delhi', latitude: 28.6139 },
  { location: 'Bangalore, Karnataka', latitude: 12.9716 },
  { location: 'Shimla, Himachal Pradesh', latitude: 31.7775 },
  { location: 'Ahmedabad, Gujarat', latitude: 23.0225 },
  { location: 'Mumbai, Maharashtra' },
  { location: 'Kolkata, West Bengal' }
]
```

### Tasks with Coordinates
**59 references** to latitude/longitude in `MOCK_TASKS` array:

```typescript
export interface TaskMockData {
  id: string;
  location: string;          // Human-readable location name
  latitude: number;          // Decimal degrees (e.g., 17.385)
  longitude: number;         // Decimal degrees (e.g., 78.487)
  disasterId: string;
  disasterName: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 'RESCUE' | 'MEDICAL' | 'FOOD_DISTRIBUTION' | 'SHELTER' | 'LOGISTICS' | ...;
  // ... other fields
}

// Sample task coordinates (all in Hyderabad area):
{
  id: 'task-1',
  location: 'Hyderabad, Telangana',
  latitude: 17.385,
  longitude: 78.487,
}
{
  id: 'task-2',
  location: 'Hyderabad Medical Center',
  latitude: 17.38,
  longitude: 78.49,
}
// 48 more tasks across 6+ disaster areas with unique coordinates
```

### Volunteers with Location Coordinates
**5 volunteer suggestions** with location data:

```typescript
export interface VolunteerSuggestionMockData {
  volunteer: {
    id: string;
    name: string;
    skills: string[];
    burnoutScore: number;
    isAvailable: boolean;
    currentLocation?: { lat: number; lng: number };  // ← Map-ready
    currentActiveTasks: number;
  };
  scoreBreakdown: {
    skillMatch: number;
    distanceScore: number;        // ← Distance calculated
    availabilityScore: number;
    burnoutScore: number;
    workloadScore: number;
    finalScore: number;
  };
}

// Sample volunteer coordinates (Hyderabad region):
{
  id: 'vol-1',
  name: 'Raj Kumar',
  currentLocation: { lat: 17.38, lng: 78.48 },
  avatar: '👨‍🚒',
  skills: ['Search & Rescue', 'First Aid', 'Swimming'],
  scoreBreakdown: {
    skillMatch: 100,
    distanceScore: 95,          // Already calculated!
    availabilityScore: 100,
    burnoutScore: 55,
    workloadScore: 60,
    finalScore: 82,
  }
}
// 4 more volunteers with nearby coordinates
```

---

## 4. Data Structures for Coordinates

### Coordinate Format Standardization

**Two patterns in use:**
```typescript
// Pattern 1: Task/Disaster (absolute naming)
latitude: number;
longitude: number;

// Pattern 2: Volunteer location (relative naming)
currentLocation: { lat: number; lng: number };
```

**Recommendation for Day 5:**
Create unified interface:
```typescript
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

// Or with aliases:
export interface Location {
  lat: number;
  lng: number;
}
```

### API Type Definitions (PWA)
From `frontend-pwa/src/types/api.ts`:
```typescript
export interface TaskResponse {
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    urgency: string;
    description?: string;
    latitude?: number;        // ← Already in API response
    longitude?: number;       // ← Already in API response
  }>;
}

export interface NearbyTaskResponse {
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    urgency: string;
    description?: string;
    distanceKm: number;      // ← Distance calculated server-side
  }>;
}
```

### Entity Types (PWA)
From `frontend-pwa/src/types/entities.ts`:
```typescript
export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  skills: string[];
  token: string;
  currentLat?: number;      // ← Location stored
  currentLon?: number;
  lastSyncAt?: string;
}
```

---

## 5. Data Fetching Hooks & Patterns

### Dashboard Features (Not Using Custom Hooks)
- Uses mock data directly from `mockData.ts`
- **Example**: `DisasterDetailPage.tsx` hardcodes `MOCK_DISASTER_DETAIL`
- **Example**: `DisastersPage.tsx` filters disasters by `.map()` over inline mock arrays

### PWA - Rich Hook Ecosystem

#### Primary Task Hook
**File**: `frontend-pwa/src/features/tasks/hooks/useTasks.ts`
```typescript
export function useTasks() {
  const tasks = useTasksStore((state) => state.tasks);
  const setTasks = useTasksStore((state) => state.setTasks);
  const updateTask = useTasksStore((state) => state.updateTask);
  const lastFetch = useTasksStore((state) => state.lastFetch);
  
  return {
    tasks,              // All tasks with latitude/longitude
    refresh,            // Async refresh from API
    loadFromDB,         // Load from IndexedDB
    updateTask,         // Update task + DB sync
    lastFetch,          // Cache timestamp
  };
}
```

#### Task Store
**File**: `frontend-pwa/src/features/tasks/stores/tasksStore.ts`
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  urgency: string;
  status: string;
  latitude?: number;    // ← Map-ready
  longitude?: number;   // ← Map-ready
  estimatedHours?: number;
  disasterName?: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
  updatedAt: string;
}

// Zustand store with persistence
useTasksStore.setTasks(tasks)
useTasksStore.updateTask(id, updates)
```

#### API Functions
**File**: `frontend-pwa/src/lib/api.ts`
```typescript
// Fetch all tasks
export async function fetchTasks(): Promise<ApiResponse<...>

// Fetch nearby tasks based on location
export async function fetchNearbyTasks(lat: number, lon: number): Promise<ApiResponse<...>

// Update volunteer location
export async function updateLocation(lat: number, lon: number)
```

#### Offline Detection Hook
**File**: `frontend-pwa/src/hooks/useOffline.ts`
```typescript
export function useOffline() {
  const isOffline = useOfflineStore((state) => state.isOffline);
  const pendingSyncCount = useOfflineStore((state) => state.pendingSyncCount);
  
  return {
    isOffline,          // Boolean offline status
    isOnline,           // Inverse
    pendingSyncCount,   // Pending sync operations
  };
}
```

#### Offline Sync Hook
**File**: `frontend-pwa/src/hooks/useOfflineSync.ts`
```typescript
export function useOfflineSync() {
  return {
    syncNow,
