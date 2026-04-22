# SevaSync Authentication & Authorization System - Pre-Day 8 Analysis

## EXECUTIVE SUMMARY

SevaSync has a **well-structured but role-based (no granular permissions)** authentication and authorization system:
- **JWT-based auth** with separate tokens for users (admin/coordinators) and volunteers
- **4 user roles** but no permission-based access control
- **No notification system** exists yet
- **No real-time messaging** infrastructure
- Basic guards exist but no advanced permission checks
- Requires enhancement for fine-grained permissions (Day 8 goal)

---

## 1. FRONTEND ARCHITECTURE OVERVIEW

### Frontend-PWA (Volunteer App)

**Authentication State Management:**
- **Store Type:** Zustand with localStorage persistence
- **File:** `frontend-pwa/src/features/auth/stores/authStore.ts`
- **State Fields:**
  - `volunteer`: { id, name, phone, skills, token, currentLat, currentLon }
  - `loading`: Boolean for async operations
  - `error`: Error message string
  - `setVolunteer()`, `logout()`, `updateLocation()`
- **Persistence:** localStorage key `auth-store` (Zustand persist)

**Authentication Hook:**
- **File:** `frontend-pwa/src/features/auth/hooks/useAuth.ts`
- **Purpose:** Load volunteer from IndexedDB on app mount
- **Returns:** `{ volunteer, loading, error, isLoggedIn, logout }`

**API Client:**
- **File:** `frontend-pwa/src/lib/api.ts`
- **Functions:**
  - `loginVolunteer(phone)`: Phone-based auth
  - `logout()`: Clear stored auth
  - `fetchTasks()`, `fetchNearbyTasks()`: Get assigned tasks
  - `acceptTask()`, `completeTask()`: Task operations
  - `updateLocation()`: GPS location
  - `syncPendingActions()`: Sync offline queue
- **Auth Header:** `Authorization: Bearer {volunteer.token}`
- **Offline Support:** Fallback to IndexedDB + sync queue

### Frontend-Dashboard (Coordinator/Admin App)

**Authentication Context:**
- **File:** `frontend-dashboard/src/lib/auth.tsx`
- **Type:** React Context (not Zustand)
- **State:**
  - `user`: { id, name, email, role }
  - `loading`: Boolean
  - `login(email, password)`: Async function
  - `logout()`: Clear state

**API Client:**
- **File:** `frontend-dashboard/src/lib/api.ts`
- **Token Storage:** localStorage with key `token`
- **Auth Header:** `Authorization: Bearer {token}`
- **Features:**
  - `auth.login()`: Email/password login
  - `auth.me()`: Fetch current user
  - Disaster CRUD, Task CRUD, Volunteer management

**Current Limitations:**
- ❌ No ProtectedRoute component
- ❌ No role-based view guards
- ❌ Dashboard assumes all authenticated users can access all pages
- ⚠️ No React Query (uses basic fetch)

---

## 2. BACKEND AUTHENTICATION SYSTEM

### JWT Token Management

**Files:** 
- `backend/src/utils/jwt.ts` 
- `backend/src/shared/utils/jwt.ts` (duplicated)

**Token Payload Structures:**
```typescript
// User/Coordinator Tokens
interface TokenPayload {
  userId: string;
  role: UserRole;           // VOLUNTEER|NGO_COORDINATOR|DISASTER_ADMIN|SUPER_ADMIN
  email?: string;
}

// Volunteer Tokens
interface VolunteerTokenPayload {
  volunteerId: string;
  phoneHash: string;
}
```

**Token Expiry:**
- **Access Token:** 15 minutes
- **Refresh Token:** 7 days (users only)
- **Volunteer Token:** 30 days (longer for offline mobile reliability)

**Token Functions:**
- `generateAccessToken(payload)`: Create access token
- `generateRefreshToken(payload)`: Create refresh token
- `generateVolunteerToken(payload)`: Create volunteer-specific token
- `verifyAccessToken(token)`: Validate & decode
- `verifyRefreshToken(token)`: Validate & decode
- `verifyVolunteerToken(token)`: Validate & decode
- `decodeToken(token)`: Inspect without verification

**Secrets Required:**
- `ACCESS_TOKEN_SECRET` (min 32 chars)
- `REFRESH_TOKEN_SECRET` (min 32 chars)
- Both validated at startup in `env.ts`

### Encryption/Crypto Utilities

**Files:**
- `backend/src/utils/crypto.ts`
- `backend/src/shared/utils/crypto.ts`

**Phone Encryption (AES-256-GCM):**
```
Storage Format: {16-byte-iv}:{encrypted-data}:{auth-tag}
- Algorithm: AES-256-GCM (authenticated encryption)
- Key: 32 bytes (64 hex chars) from ENCRYPTION_KEY
- IV: 16 random bytes per encryption
- Auth Tag: 16 bytes for integrity verification
```

**Phone Hash (SHA-256):**
- One-way hash used for database lookups
- Enables unique constraint without exposing encrypted value

**Functions:**
- `encryptPhone(phone)`: Encrypt and return format above
- `decryptPhone(encrypted)`: Decrypt using stored IV and auth tag
- `hashPhone(phone)`: SHA-256 hash for lookups
- `generateRandomToken()`: Random token for reset tokens

### Authentication Middleware

**File:** `backend/src/middleware/auth.ts`

**Middleware Functions:**

```typescript
authenticate(req, res, next)
  Checks: Bearer token in Authorization header
  Verifies: JWT signature + expiry
  Attaches: req.user = TokenPayload
  Error: 401 Unauthorized if missing/invalid

authenticateVolunteer(req, res, next)
  Checks: Bearer token in Authorization header
  Verifies: Volunteer JWT signature
  Attaches: req.volunteer = VolunteerTokenPayload
  Error: 401 Unauthorized if missing/invalid

optionalAuth(req, res, next)
  Soft failure: Attaches req.user if valid, continues if invalid
  Used for mixed auth scenarios (public + authenticated)
```

### Authorization/RBAC Middleware

**File:** `backend/src/middleware/rbac.ts`

**Middleware Functions:**

```typescript
requireRole(...allowedRoles: UserRole[])
  Checks: req.user.role in allowedRoles
  Error: 403 Forbidden if not authorized
  Must follow authenticate() middleware

requireAdmin
  Shorthand: requireRole(DISASTER_ADMIN, SUPER_ADMIN)

requireCoordinator  
  Shorthand: requireRole(NGO_COORDINATOR, DISASTER_ADMIN, SUPER_ADMIN)

requireOwnershipOrAdmin(userIdGetter: (req) => string)
  Checks: User owns resource OR has admin role
  Example: requireOwnershipOrAdmin((req) => req.params.volunteerId)
  Error: 403 Forbidden if neither owner nor admin
```

**Current Limitations:**
- ❌ Role-based only (coarse-grained)
- ❌ No fine-grained permissions
- ❌ No permission delegation
- ❌ No dynamic permission loading from database

### Authentication Service

**File:** `backend/src/services/auth.service.ts`

**Key Methods:**

```typescript
registerUser(input)
  - Email-based registration (coordinators/admins)
  - Validates: Email uniqueness
  - Hashes: Password with bcrypt (12 rounds)
  - Returns: { user, accessToken, refreshToken }

registerVolunteer(input)
  - Phone-based registration (volunteers)
  - Encrypts: Phone number (AES-256-GCM)
  - Hashes: Phone (SHA-256 for lookups)
  - Validates: Phone format (min 10 digits)
  - Returns: { volunteer }

loginUser(input)
  - Email/password login
  - Verifies: Password with bcrypt compare
  - Checks: User isActive = true
  - Returns: { user, accessToken, refreshToken }

loginVolunteer(input)
  - Phone-based login (SMS verification in production)
  - Checks: Volunteer isActive = true
  - Returns: { volunteer, accessToken } (no refresh token)

refreshAccessToken(refreshToken)
  - Validates: Refresh token signature + expiry
  - Verifies: User still exists and active
  - Returns: { accessToken } (new access token)

getCurrentUser(userId)
  - Fetches: User profile by ID
  - Returns: Public user fields only

getCurrentVolunteer(volunteerId)
  - Fetches: Volunteer profile by ID
  - Returns: Public volunteer fields only
```

### Auth Routes

**File:** `backend/src/routes/auth.routes.ts`

```
POST   /api/auth/register              → registerUser (public)
POST   /api/auth/login                 → loginUser (public)
POST   /api/auth/register-volunteer    → registerVolunteer (public)
POST   /api/auth/login-volunteer       → loginVolunteer (public)
POST   /api/auth/refresh               → refreshAccessToken (public)
GET    /api/auth/me                    → getCurrentUser (authenticate)
GET    /api/auth/me-volunteer          → getCurrentVolunteer (authenticateVolunteer)
```

---

## 3. USER MODEL & ROLES

### User Model (Database - Prisma)

**File:** `backend/prisma/schema.prisma`

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  role       
