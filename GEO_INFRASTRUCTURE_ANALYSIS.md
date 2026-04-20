# SevaSync Geolocation & Map Infrastructure Analysis

## Executive Summary

SevaSync has a **mature geolocation backend** with distance calculations and nearby queries, but **zero frontend map components**. The infrastructure is partially ready for visualization.

**Status:**
- Backend geo utilities: ✓ COMPLETE (Haversine distance, nearby queries, matching)
- Frontend map components: ✗ NOT STARTED
- Data structures: ✓ READY (latitude/longitude fields in all entities)
- Map library: ✓ INSTALLED (Leaflet + react-leaflet in dashboard)

---

## 1. EXISTING GEOLOCATION CODE

### Backend Geospatial Utilities

**File:** `backend/src/modules/matching/matching.service.ts`

```typescript
// Haversine formula implementation
export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
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

// Distance to score conversion (0-100 scale)
// 0km = 100, 50km+ = 0 (linear decay)
function distanceToScore(distanceKm: number, maxDistanceKm: number = 50): number
```

### Backend API Endpoints for Nearby Queries

1. **Find Nearby Volunteers**
   - Endpoint: `GET /api/volunteers/nearby`
   - Query params: `lat`, `lng`, `radius` (km), `skills` (optional)
   - Returns: Volunteers within radius with distance calculated

2. **Find Nearby Tasks**
   - Endpoint: `GET /api/tasks/nearby`
   - Query params: `lat`, `lng`, `radius` (km), `status` (optional), `urgency` (optional)
   - Returns: Tasks within radius ordered by urgency then distance

### Database Geospatial Queries

**File:** `backend/src/modules/volunteers/volunteer.service.ts` (lines 269-331)

Uses PostgreSQL Haversine formula:
```sql
SELECT * FROM volunteers
WHERE 
  is_active = true
  AND (
    6371 * acos(
      cos(radians(${lat})) * 
      cos(radians(current_lat)) * 
      cos(radians(current_lng) - radians(${lng})) + 
      sin(radians(${lat})) * 
      sin(radians(current_lat))
    )
  ) <= ${radiusKm}
ORDER BY distance_km ASC
LIMIT 50
```

**File:** `backend/src/modules/tasks/task.service.ts` (lines 415-470)

Similar query for tasks with support for filters (status, urgency).

---

## 2. VOLUNTEER LOCATION DATA STRUCTURE

### Volunteer Model (Prisma Schema)

**File:** `backend/prisma/schema.prisma` (lines 48-77)

```prisma
model Volunteer {
  id                   String    @id @default(uuid())
  name                 String
  language             String    @default("en")
  skills               Json      @default("[]")
  
  // GEOLOCATION FIELDS
  availabilityRadiusKm Int       @default(10)        // Preference radius
  currentLat           Decimal?  @map("current_lat") @db.Decimal(10, 8)
  currentLng           Decimal?  @map("current_lng") @db.Decimal(11, 8)
  
  // ACTIVITY FIELDS
  isActive             Boolean   @default(true)
  isAvailable          Boolean   @default(true)
  burnoutScore         Decimal   @default(0.0)      @db.Decimal(5, 2)
  lastCheckin          DateTime?
  lastActiveAt         DateTime?
  
  // Relations
  assignedTasks        Task[]
  taskLogs             TaskLog[]
  wellnessCheckins     WellnessCheckin[]
  
  @@index([isActive])
  @@index([isAvailable])
  @@map("volunteers")
}
```

### Frontend Volunteer Type (PWA)

**File:** `frontend-pwa/src/types/entities.ts`

```typescript
export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  skills: string[];
  token: string;
  currentLat?: number;
  currentLon?: number;      // Note: uses "Lon" not "Lng"
  lastSyncAt?: string;
}
```

### Frontend Volunteer Response (Dashboard)

**File:** `frontend-dashboard/src/lib/api.ts` (lines 77-86)

```typescript
export const volunteers = {
  list: (...) => request<{
    id: string;
    name: string;
    skills: string[];
    isAvailable: boolean;
    currentLat?: number;
    currentLng?: number;
    burnoutScore: number;
  }[]>(...)
}
```

**Additional volunteer fields used in UI:**
- `location?: string` - Textual location (e.g., "Hyderabad, India")
- `currentLocation?: { lat: number; lng: number }` (in mock data)
- `availabilityRadiusKm` - Search radius preference

---

## 3. TASK LOCATION DATA STRUCTURE

### Task Model (Prisma Schema)

**File:** `backend/prisma/schema.prisma` (lines 132-163)

```prisma
model Task {
  id                  String      @id @default(uuid())
  disasterId          String
  title               String
  description         String?
  type                TaskType
  requiredSkills      Json        @default("[]")
  urgency             TaskUrgency
  
  // LOCATION FIELDS - REQUIRED
  latitude            Decimal     @db.Decimal(10, 8)    // ALWAYS PRESENT
  longitude           Decimal     @db.Decimal(11, 8)    // ALWAYS PRESENT
  
  // STATUS & ASSIGNMENT
  assignedVolunteerId String?
  status              TaskStatus  @default(OPEN)
  maxVolunteers       Int         @default(1)
  currentVolunteers   Int         @default(0)
  estimatedHours      Int?
  
  // Relations
  disaster            Disaster
  assignedVolunteer   Volunteer?
  creator             User
  taskLogs            TaskLog[]
  
  @@index([disasterId, status])
  @@map("tasks")
}
```

### Frontend Task Type (Dashboard)

**File:** `frontend-dashboard/src/pages/TasksPage.tsx` (lines 6-24)

```typescript
interface TaskData {
  id: string;
  title: string;
  type: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;                              // Textual location
  disasterId: string;
  disasterName: string;
  assignedVolunteer?: { name: string; id: string };
  requiredSkills: string[];
  estimatedHours?: number;
  maxVolunteers: number;
  currentVolunteers: number;
  description?: string;
  latitude?: number;                             // OPTIONAL
  longitude?: number;                            // OPTIONAL
  createdAt?: Date;
}
```

### Mock Task Data Example

**File:** `frontend-dashboard/src/lib/mockData.ts` (lines 62-101)

```typescript
export interface TaskMockData {
  id: string;
  disasterId: string;
  disasterName: string;
  title: string;
  type: 'RESCUE' | 'MEDICAL' | ... ;
  location: string;
  latitude: number;                              // ALWAYS PRESENT
  longitude: number;                             // ALWAYS PRESENT
  assignedVolunteer?: { ... };
  estimatedHours?: number;
  maxVolunteers: number;
  currentVolunteers: number;
}

export const MOCK_TASKS: TaskMockData[] = [
  {
    id: 'task-1',
    location: 'Hyderabad, Telangana',
    latitude: 17.385,
    longitude: 78.487,
    ...
  },
  {
    id: 'task-2',
    location: 'Hyderabad Medical Center',
    latitude: 17.38,
    longitude: 78.49,
    ...
  }
];
```

---

## 4. DISASTER LOCATION DATA STRUCTURE

### Disaster Model (Prisma Schema)

**File:** `backend/prisma/schema.prisma` (lines 83-103)

```prisma
model Disaster {
  id        String             @id @default(uuid())
  name      String             // "Hyderabad Floods 2026"
  type      DisasterType
  severity  DisasterSeverity   @default(MEDIUM)
  location  String             // Textual location
  
  // LOCATION FIELDS - OPTIONAL
  latitude  Decimal?           @db.Decimal(10, 8)
  longitude Decimal?           @db.Decimal(11, 8)
  
  status    DisasterStatus     @default(ACTIVE)
  startDate DateTime
  endDate   DateTime?
  
  // Relations
  tasks Task[]
  
  @@index([status])
  @@index([severity])
  @@map("disasters")
}

enum DisasterType {
  FLOOD, CYCLONE, EARTHQUAKE, LANDSLIDE, FIRE, OTHER
}

enum DisasterStatus {
  PLANNING, ACTIVE, RESOLVED, ARCHIVED
}

enum DisasterSeverity {
  LOW, MEDIUM, HIGH, CRITICAL
}
```

### Frontend Disaster Type (Dashboard)

**File:** `frontend-dashboard/src/pages/DisastersPage.tsx` (lines 6-14)

```typescript
interface CreateDisasterForm {
  name: string;
  typ
