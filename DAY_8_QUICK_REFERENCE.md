# Day 8 - Authentication & Authorization - Quick Reference

## Current State Summary

| Component | Status | Location |
|-----------|--------|----------|
| **JWT Token System** | ✅ Complete | `backend/src/utils/jwt.ts` |
| **Login/Register** | ✅ Complete | `backend/src/services/auth.service.ts` |
| **Auth Routes** | ✅ Complete | `backend/src/routes/auth.routes.ts` |
| **Auth Middleware** | ✅ Complete | `backend/src/middleware/auth.ts` |
| **Role-Based Access** | ⚠️ Partial | `backend/src/middleware/rbac.ts` |
| **Permission System** | ❌ Missing | *To be built* |
| **Frontend Auth** | ✅ Complete | `frontend-pwa/src/features/auth/` |
| **Frontend Guards** | ❌ Missing | *To be built* |
| **Notifications** | ❌ Missing | *Future enhancement* |

---

## Frontend Authentication

### PWA (Volunteers)

```typescript
// Login
import { loginVolunteer } from '@/lib/api';
await loginVolunteer('+919876543210');

// Check auth
import { useAuth } from '@/features/auth/hooks/useAuth';
const { volunteer, isLoggedIn, logout } = useAuth();

// API calls automatically include token
// (from IndexedDB via getAuthHeaders())
```

### Dashboard (Coordinators/Admins)

```typescript
// Login
import { useAuth } from '@/lib/auth';
const { login } = useAuth();
await login('coordinator@ngo.org', 'password123');

// Check auth
const { user, logout } = useAuth();

// API calls include token
// (from localStorage via setToken())
```

---

## Backend Authentication

### User Login (Email/Password)

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "coordinator@ngo.org",
  "password": "password123"
}

# Response:
{
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "coordinator@ngo.org",
    "name": "John Coordinator",
    "role": "NGO_COORDINATOR",
    "organization": "LocalNGO",
    "region": "Hyderabad"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Volunteer Login (Phone Only)

```bash
POST /api/auth/login-volunteer
Content-Type: application/json

{
  "phone": "+919876543210"
}

# Response:
{
  "message": "Login successful",
  "volunteer": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Rajesh",
    "language": "hi",
    "skills": ["medical", "logistics"]
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Refresh Token

```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# Response:
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Endpoints

```bash
# All protected endpoints require Authorization header
Authorization: Bearer {accessToken}

# Example:
GET /api/volunteers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Must have NGO_COORDINATOR or higher role
# Returns 401 if no token
# Returns 403 if insufficient role
```

---

## Current Roles

```typescript
enum UserRole {
  VOLUNTEER = 'VOLUNTEER',                    // Volunteers (phone auth)
  NGO_COORDINATOR = 'NGO_COORDINATOR',        // Can create/assign tasks
  DISASTER_ADMIN = 'DISASTER_ADMIN',          // Can manage disasters
  SUPER_ADMIN = 'SUPER_ADMIN',                // All permissions
}
```

### Role Capabilities

| Capability | VOLUNTEER | NGO_COORDINATOR | DISASTER_ADMIN | SUPER_ADMIN |
|------------|-----------|-----------------|-----------------|-------------|
| View tasks | ✅ | ✅ | ✅ | ✅ |
| Accept task | ✅ | ✅ | ✅ | ✅ |
| Create task | ❌ | ✅ | ✅ | ✅ |
| View volunteers | ❌ | ✅ | ✅ | ✅ |
| Create disaster | ❌ | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ | ✅ |

---

## Middleware Stack

### Authentication

```typescript
// Extract JWT token from Authorization header
// Verify signature and expiry
// Attach to req.user or req.volunteer

import { authenticate, authenticateVolunteer } from '@/middleware/auth';

router.get('/protected-endpoint', authenticate, handler);
```

### Authorization (RBAC)

```typescript
// Check user role against allowed list
import { 
  requireRole, 
  requireAdmin, 
  requireCoordinator,
  requireOwnershipOrAdmin 
} from '@/middleware/rbac';

// Specific role
router.post('/tasks', authenticate, requireCoordinator, handler);

// Multiple roles
router.delete('/volunteer/:id', 
  authenticate, 
  requireRole(DISASTER_ADMIN, SUPER_ADMIN), 
  handler
);

// Ownership check
router.put('/volunteer/:id',
  authenticate,
  requireOwnershipOrAdmin((req) => req.params.id),
  handler
);
```

---

## Protected Routes by Feature

### Tasks

| Route | Method | Auth | Role | What it does |
|-------|--------|------|------|--------------|
| `/tasks` | GET | Yes | Any | List all tasks |
| `/tasks` | POST | Yes | Coordinator+ | Create new task |
| `/tasks/:id` | GET | Yes | Any | Get task details |
| `/tasks/:id` | PUT | Yes | Coordinator+ | Update task |
| `/tasks/:id/assign` | POST | Yes | Coordinator+ | Assign to volunteer |
| `/tasks/:id/start` | POST | Yes | Any | Start task |
| `/tasks/:id/complete` | POST | Yes | Any | Complete + log hours |
| `/tasks/:id/cancel` | POST | Yes | Coordinator+ | Cancel task |

### Volunteers

| Route | Method | Auth | Role | What it does |
|-------|--------|------|------|--------------|
| `/volunteers` | GET | Yes | Coordinator+ | List all volunteers |
| `/volunteers/:id` | GET | Yes | Any | View volunteer |
| `/volunteers/:id` | PUT | Yes | Owner/Admin | Update profile |
| `/volunteers/:id/location` | POST | Yes | Owner/Admin | Update GPS |
| `/volunteers/:id/checkin` | POST | Yes | Owner/Admin | Wellness checkin |
| `/volunteers/:id` | DELETE | Yes | Admin+ | Deactivate |

### Disasters

| Route | Method | Auth | Role | What it does |
|-------|--------|------|------|--------------|
| `/disasters` | POST | Yes | Admin+ | Create disaster |
| `/disasters` | GET | Yes | Any | List disasters |
| `/disasters/:id` | GET | Yes | Any | View disaster |
| `/disasters/:id` | PATCH | Yes | Admin+ | Update |
| `/disasters/:id/activate` | POST | Yes | Admin+ | Set ACTIVE |
| `/disasters/:id/resolve` | POST | Yes | Admin+ | Set RESOLVED |
| `/disasters/:id/stats` | GET | Yes | Coordinator+ | View stats |

---

## Token Expiry & Refresh

| Token Type | Expiry | Refresh? | Use Case |
|-----------|--------|----------|----------|
| **Access (User)** | 15 minutes | Yes via /refresh | Short-lived for security |
| **Refresh (User)** | 7 days | No | Long-lived for convenience |
| **Volunteer Token** | 30 days | No | Offline reliability, no refresh |

### Refresh Flow

```
1. Access token expires (15m)
2. Frontend detects 401 response
3. POST /api/auth/refresh with refreshToken
4. Backend validates and generates new accessToken
5. Frontend retries original request with new token
```

---

## Database Tables

### Users (Email-based)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  role VARCHAR NOT NULL,  -- VOLUNTEER|NGO_COORDINATOR|DISASTER_ADMIN|SUPER_ADMIN
  name VARCHAR NOT NULL,
  organization VARCHAR,
  region VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Volunteers (Phone-based)

```sql
CREATE TABLE volunteers (
  id UUID PRIMARY KEY,
  phone_encrypted VARCHAR UNIQUE NOT NULL,  -- AES-256-GCM
  phone_hash VARCHAR UNIQUE NOT NULL,       -- SHA-256 for lookups
  name VARCHAR NOT NULL,
  language VARCHAR DEFAULT 'en',
  skills JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  burnout_score DECIMAL DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_volunteers_phone_hash ON volunteers(phone_hash);
CREATE INDEX idx_volunteers_is_active ON volunteers(is_active);
```

---

## Security Features

### Password Security

```typescript
// Bcrypt with 12 rounds
import bcrypt from 'bcrypt';

const hash = await
