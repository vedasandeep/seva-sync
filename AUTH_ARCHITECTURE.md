# SevaSync Authentication & Authorization Architecture

## System Overview Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND APPLICATIONS                         │
├────────────────────────────┬─────────────────────────────────────┤
│  PWA (Volunteers)          │  Dashboard (Coordinators/Admins)     │
├────────────────────────────┼─────────────────────────────────────┤
│                            │                                      │
│  authStore (Zustand)       │  AuthContext (React)                │
│  - volunteer object        │  - user object                       │
│  - token                   │  - token                             │
│  - persist to localStorage │  - localStorage key: 'token'        │
│                            │                                      │
│  useAuth() hook            │  useAuth() hook                      │
│  - loads from IndexedDB    │  - loads from localStorage          │
│  - manages login/logout    │  - manages login/logout             │
│                            │                                      │
│  Phone-based login         │  Email-based login                   │
│  Authorization: Bearer     │  Authorization: Bearer               │
└────────────────────────────┴─────────────────────────────────────┘
                    ↓ HTTPS with Bearer Tokens
┌──────────────────────────────────────────────────────────────────┐
│                    API GATEWAY / SECURITY LAYER                   │
├──────────────────────────────────────────────────────────────────┤
│  - CORS (localhost:5173, 5174)                                   │
│  - Helmet (security headers)                                      │
│  - Rate Limiting (100/15min, excludes /api/ivr)                 │
│  - Request ID tracking                                            │
│  - Pino Logging                                                   │
└──────────────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────────────┐
│              BACKEND API (Node.js/Express)                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  EXPRESS MIDDLEWARE PIPELINE (per request):                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. requestIdMiddleware (attach request ID)                │ │
│  │ 2. helmet() (security headers)                            │ │
│  │ 3. cors() (CORS configuration)                            │ │
│  │ 4. express.json() (parse body)                            │ │
│  │ 5. pinoLoggingMiddleware() (request logging)              │ │
│  │ 6. rateLimit() (100 req/15min)                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ROUTE HANDLER:                                            │ │
│  │ ┌──────────────────────────────────────────────────────┐ │ │
│  │ │ 1. authenticate / authenticateVolunteer             │ │ │
│  │ │    (extract & verify Bearer token)                  │ │ │
│  │ │    → Attach: req.user or req.volunteer              │ │ │
│  │ │    → Error: 401 Unauthorized                        │ │ │
│  │ │                                                      │ │ │
│  │ │ 2. validateBody(schema)                             │ │ │
│  │ │    (Zod schema validation)                          │ │ │
│  │ │    → Error: 400 Bad Request                         │ │ │
│  │ │                                                      │ │ │
│  │ │ 3. requireRole / requireCoordinator / requireAdmin   │ │ │
│  │ │    (check req.user.role)                            │ │ │
│  │ │    → Error: 403 Forbidden                           │ │ │
│  │ │                                                      │ │ │
│  │ │ 4. requireOwnershipOrAdmin                          │ │ │
│  │ │    (check ownership OR admin role)                  │ │ │
│  │ │    → Error: 403 Forbidden                           │ │ │
│  │ │                                                      │ │ │
│  │ │ 5. Controller Logic                                 │ │ │
│  │ │    (business logic, database queries)               │ │ │
│  │ │                                                      │ │ │
│  │ │ 6. Response (200, 201, 400, 403, 404, 500, etc)    │ │ │
│  │ └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↓                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ GLOBAL ERROR HANDLER:                                     │ │
│  │ - Catch unhandled errors                                 │ │
│  │ - Format error response                                  │ │
│  │ - Log errors                                             │ │
│  │ - Return 500 Internal Server Error                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ROUTES:                                                         │
│  ├─ /api/auth/*       (registerUser, loginUser, etc)           │
│  ├─ /api/volunteers/* (CRUD with permission checks)            │
│  ├─ /api/tasks/*      (Create needs coordinator role)          │
│  ├─ /api/disasters/*  (Admin-only operations)                  │
│  ├─ /api/ivr/*        (Twilio webhooks)                        │
│  ├─ /api/matching/*   (Auto-assignment logic)                  │
│  ├─ /api/dashboard/*  (Analytics/statistics)                   │
│  └─ /api/v1/sync/*    (Offline sync)                           │
│                                                                   │
│  SERVICES:                                                       │
│  ├─ auth.service       (Login, registration, tokens)            │
│  ├─ volunteer.service  (CRUD, wellness, location)              │
│  ├─ task.service       (Task management, assignment)            │
│  ├─ disaster.service   (Disaster lifecycle)                     │
│  ├─ matching.service   (Volunteer matching)                     │
│  └─ ivr.service        (Twilio integration)                     │
│                                                                   │
│  UTILITIES:                                                      │
│  ├─ utils/jwt.ts       (generateAccessToken, verifyToken)      │
│  ├─ utils/crypto.ts    (encryptPhone, hashPhone)               │
│  ├─ middleware/auth.ts (authenticate, authenticateVolunteer)   │
│  └─ middleware/rbac.ts (requireRole, requireCoordinator)       │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                    ↓ SQL Queries
┌──────────────────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL)                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  AUTH TABLES:                                                    │
│  ├─ users (email-based: coordinators/admins)                    │
│  │  ├─ id: UUID                                                 │
│  │  ├─ email: VARCHAR UNIQUE                                    │
│  │  ├─ passwordHash: VARCHAR (bcrypt)                          │
│  │  ├─ role: ENUM (VOLUNTEER, NGO_COORDINATOR, ...)           │
│  │  ├─ name, organization, region, isActive                   │
│  │  └─ Indexes: email, role                                    │
│  │                                                               │
│  └─ volunteers (phone-based, separate from users)              │
│     ├─ id: UUID                                                │
│     ├─ phoneEncrypted: VARCHAR (AES-256-GCM)                  │
│     ├─ phoneHash: VARCHAR (S
