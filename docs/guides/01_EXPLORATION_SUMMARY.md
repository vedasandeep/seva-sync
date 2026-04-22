# SevaSync Codebase Exploration - Complete Summary

**Date:** April 21, 2026  
**Scope:** Pre-Day 8 Authentication & Authorization System Analysis  
**Status:** ✅ Complete

---

## Documents Generated

This exploration generated **4 comprehensive documents**:

1. **DAY_8_PRE_ANALYSIS.md** (268 lines)
   - Detailed breakdown of current auth system
   - Database schema documentation
   - Route-level guard summary
   - Session/token management details
   - What's missing for Day 8

2. **AUTH_ARCHITECTURE.md** (323 lines)
   - Complete system architecture diagram
   - Authentication flow sequences (6 flows)
   - Token structure details
   - Encryption implementation details
   - Role & permission matrix
   - Day 8 implementation plan

3. **DAY_8_QUICK_REFERENCE.md** (126 lines)
   - Quick lookup tables
   - API endpoint reference
   - Frontend authentication examples
   - Security features summary
   - File locations
   - Common errors & solutions

4. **EXPLORATION_SUMMARY.md** (This document)
   - High-level overview of findings
   - Key statistics
   - Recommendations

---

## Key Findings

### ✅ What Works Well

1. **JWT Token System** (Mature)
   - Separate tokens for users and volunteers
   - Proper expiry (15m access, 7d refresh for users; 30d for volunteers)
   - Signature verification with secrets
   - Issuer claim validation

2. **Authentication Endpoints** (Complete)
   - Email/password login for coordinators/admins
   - Phone-based login for volunteers
   - Token refresh mechanism
   - User profile endpoints
   - Input validation with Zod schemas

3. **Security Implementation** (Strong)
   - Bcrypt password hashing (12 rounds)
   - AES-256-GCM phone encryption
   - SHA-256 phone hashing for lookups
   - CORS, Helmet, rate limiting
   - Request ID tracking

4. **Role-Based Access** (Basic)
   - 4 user roles defined
   - Middleware to check roles
   - Route-level guards implemented
   - Ownership validation supported

5. **Frontend State Management** (Well-Structured)
   - PWA: Zustand store with persistence
   - Dashboard: React Context
   - IndexedDB for offline storage (PWA)
   - localStorage for tokens

---

### ⚠️ What Needs Improvement

1. **Permission System** (Missing)
   - No granular permissions (only role-based)
   - No permission mapping/matrix
   - Same role controls multiple features
   - No dynamic permission loading

2. **Authorization Checks** (Limited)
   - Only 3 main middleware: requireRole, requireCoordinator, requireAdmin
   - No feature-level permissions
   - Resource-level ACLs only for ownership
   - No permission caching

3. **Frontend Guards** (Not Implemented)
   - No ProtectedRoute component
   - No usePermission() hook
   - Dashboard has no role-based UI
   - Assumes all authenticated users can access all pages

4. **Session Management** (Incomplete)
   - No token blacklist on logout
   - No session revocation
   - No concurrent session limits
   - No device binding
   - No IP validation

5. **Notifications** (Entirely Missing)
   - No notification table/model
   - No notification service
   - No real-time updates
   - No push notifications
   - No email integration

6. **Audit & Logging** (Minimal)
   - Request logging only
   - No audit trail of user actions
   - No permission change tracking
   - No suspicious activity detection

---

## Architecture Overview

### Frontend (2 Applications)

**PWA (Volunteers):** `frontend-pwa/`
- Zustand state management
- IndexedDB for offline storage
- Service worker for PWA features
- Phone-based authentication
- 30-day token for reliability

**Dashboard (Coordinators):** `frontend-dashboard/`
- React Context for auth
- localStorage for token storage
- Email-based authentication
- No offline support yet
- No React Query integration

### Backend API

**Core Framework:** Express.js with TypeScript  
**Database:** PostgreSQL with Prisma ORM  
**Key Directories:**
- `src/middleware/` - Auth/RBAC/validation
- `src/routes/` - API endpoints
- `src/controllers/` - HTTP request handlers
- `src/services/` - Business logic
- `src/utils/` - JWT, crypto utilities
- `prisma/schema.prisma` - Data models

### Database

**Auth Tables:**
- `users` (10 fields) - Coordinators/admins only
- `volunteers` (13 fields) - Phone-based, separate from users

**Related Tables:**
- `tasks` (14 fields, references users & volunteers)
- `disasters` (6 fields)
- `task_logs` (9 fields)
- `wellness_checkins` (5 fields)
- `ivr_logs` (6 fields)

---

## Current Authentication Flow

```
USER LOGIN
┌─────────────────────────┐
│ 1. POST /auth/login     │
│ {email, password}       │
└────────────┬────────────┘
             │
             ├─ Verify email exists
             ├─ bcrypt compare password
             ├─ Check isActive
             └─ Generate tokens (15m + 7d)
                │
                └─ Return {user, accessToken, refreshToken}

VOLUNTEER LOGIN
┌──────────────────────────────┐
│ 1. POST /auth/login-volunteer│
│ {phone}                      │
└────────────┬─────────────────┘
             │
             ├─ Hash phone (SHA-256)
             ├─ Lookup volunteer
             ├─ Check isActive
             └─ Generate token (30d)
                │
                └─ Return {volunteer, accessToken}

PROTECTED REQUEST
┌──────────────────────────┐
│ Any request with header: │
│ Authorization: Bearer ... │
└────────────┬─────────────┘
             │
             ├─ middleware/auth.ts
             │  ├─ Extract token
             │  ├─ jwt.verify()
             │  └─ Attach req.user
             │
             ├─ middleware/rbac.ts
             │  ├─ Check req.user.role
             │  └─ requireRole/requireCoordinator/etc
             │
             └─ Handler executes (or 401/403)
```

---

## User Roles & Capabilities

### Role Hierarchy

```
SUPER_ADMIN (System Admin)
  └─ Can do everything
  
DISASTER_ADMIN (Regional Admin)
  └─ Can manage disasters, users, tasks
  
NGO_COORDINATOR (Local Coordinator)
  └─ Can create/assign tasks, view volunteers
  
VOLUNTEER (Disaster Responder)
  └─ Can accept tasks, log hours, update location
```

### Capability Matrix

| Feature | VOLUNTEER | COORDINATOR | DISASTER_ADMIN | SUPER_ADMIN |
|---------|-----------|-------------|-----------------|-------------|
| View tasks | ✅ | ✅ | ✅ | ✅ |
| Create task | ❌ | ✅ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ | ✅ |

---

## Token Management Details

### Access Token (Users)
- **Expiry:** 15 minutes
- **Format:** JWT with userId, role, email
- **Secret:** ACCESS_TOKEN_SECRET (32+ chars)
- **Used for:** All API requests

### Refresh Token (Users Only)
- **Expiry:** 7 days
- **Format:** JWT with same payload
- **Secret:** REFRESH_TOKEN_SECRET (32+ chars)
- **Endpoint:** POST /api/auth/refresh
- **No Server Storage:** Stateless design

### Volunteer Token (Phone Users)
- **Expiry:** 30 days
- **Format:** JWT with volunteerId, phoneHash
- **Secret:** ACCESS_TOKEN_SECRET
- **No Refresh:** Token valid for 30 days
- **Design:** Offline-first (longer validity)

---

## Security Implementation

### Password Security
- Bcrypt with 12 rounds (8^12 iterations)
- Time-constant comparison to prevent timing attacks
- Minimum 8 characters enforced by Zod validation

### Phone Number Security
- AES-256-GCM encryption (authenticated encryption)
- Random IV per encryption (16 bytes)
- Auth tag for integrity verification
- SHA-256 hash for indexed lookups (one-way)
- Both encrypted and hash stored

### API Security
- CORS configured for localhost:5173, 5174
- Helmet.js for security headers
- Rate limiting: 100 requests per 15 minutes
- Request ID tracking for audit trail
- Pino logging for all requests

### JWT Security
- Signature verification with secret keys
- Issuer claim validation ("sevasync-api")
- Expiry claim validation
- No sensitive data in payload (no passwords)

---

## Database Schema Highlights

### Users Table
```
- id: UUID (primary key)
- email: VARCHAR UNIQUE (indexed)
- password_hash: VARCHAR (bcrypt)
- role: VARCHAR (ENUM, indexed)
- name, organization, region: VARCHAR
- isActive: BOOLEAN (soft delete)
- createdAt, updatedAt: TIMESTAMP
```

### Volunteers Table
```
- id: UUID
