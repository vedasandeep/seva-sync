# SevaSync - Project Report

## Executive Summary

**SevaSync** is a disaster-resilient volunteer coordination platform designed for India. It enables NGOs and disaster response teams to efficiently match, coordinate, and manage volunteers during emergencies like floods, cyclones, and earthquakes. The platform supports offline-first operation and includes an IVR (Interactive Voice Response) system for volunteers without smartphones.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Architecture](#4-architecture)
5. [Database Schema](#5-database-schema)
6. [API Endpoints](#6-api-endpoints)
7. [Core Services](#7-core-services)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Key Features](#9-key-features)
10. [How to Run](#10-how-to-run)
11. [Environment Variables](#11-environment-variables)
12. [Testing](#12-testing)
13. [Production Deployment](#13-production-deployment)

---

## 1. Project Overview

### Problem Statement
During disasters in India, volunteer coordination is chaotic:
- Volunteers don't know where help is needed
- Coordinators can't track volunteer availability
- No system works offline or via basic phones
- Volunteer burnout is not monitored

### Solution
SevaSync provides:
- **AI-powered matching** of volunteers to tasks based on skills, location, and availability
- **Offline-first PWA** for volunteers in low-connectivity areas
- **IVR system** for feature phone users (Twilio/Exotel integration)
- **Burnout prevention** through wellness check-ins and scoring
- **Real-time coordination dashboard** for NGO coordinators

---

## 2. Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | REST API server |
| **TypeScript** | Type safety |
| **Prisma ORM** | Database access |
| **PostgreSQL + PostGIS** | Database with geospatial support |
| **Redis** | Caching & session storage |
| **JWT** | Authentication tokens |
| **Twilio** | IVR/SMS integration |
| **Zod** | Request validation |

### Frontend (Planned)
| Technology | Purpose |
|------------|---------|
| **React + Vite** | Dashboard SPA |
| **React Native / PWA** | Volunteer mobile app |
| **TailwindCSS** | Styling |
| **React Query** | Data fetching |

### DevOps
| Technology | Purpose |
|------------|---------|
| **Docker Compose** | Local development |
| **Jest** | Testing |
| **GitHub Actions** | CI/CD |

---

## 3. Project Structure

```
SevaSync/
├── backend/                    # Node.js API server
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Seed data
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── routes/            # API route definitions
│   │   ├── middleware/        # Auth, RBAC, validation
│   │   ├── utils/             # Crypto, JWT, Prisma client
│   │   ├── types/             # Zod schemas & TypeScript types
│   │   └── server.ts          # Express app entry point
│   ├── tests/                 # Jest test suites
│   ├── package.json
│   └── Dockerfile
├── frontend-dashboard/        # Admin/Coordinator dashboard (React)
├── frontend-pwa/              # Volunteer PWA (React)
├── docs/                      # Documentation
├── docker-compose.yml         # Local dev environment
└── README.md
```

---

## 4. Architecture

### High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Dashboard     │     │   Volunteer     │     │   IVR System    │
│   (React SPA)   │     │   (PWA/Mobile)  │     │   (Twilio)      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    Express REST API     │
                    │    (Node.js + TS)       │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌────────▼────────┐   ┌──────────▼──────────┐   ┌───────▼───────┐
│   PostgreSQL    │   │       Redis         │   │    Twilio     │
│   (PostGIS)     │   │   (Cache/Sessions)  │   │   (IVR/SMS)   │
└─────────────────┘   └─────────────────────┘   └───────────────┘
```

### Request Flow

```
Request → Rate Limiter → CORS → Body Parser → Auth Middleware → RBAC → Controller → Service → Prisma → Database
```

---

## 5. Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │  Disaster   │       │  Volunteer  │
│─────────────│       │─────────────│       │─────────────│
│ id          │       │ id          │       │ id          │
│ email       │       │ name        │       │ phoneHash   │
│ passwordHash│       │ type        │       │ name        │
│ role        │──────<│ location    │>──────│ skills[]    │
│ name        │       │ status      │       │ location    │
│ organization│       │ startDate   │       │ burnoutScore│
└─────────────┘       └──────┬──────┘       └──────┬──────┘
                             │                     │
                             │                     │
                      ┌──────▼──────┐              │
                      │    Task     │              │
                      │─────────────│              │
                      │ id          │              │
                      │ title       │<─────────────┘
                      │ urgency     │
                      │ status      │
                      │ location    │
                      └──────┬──────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐
       │  TaskLog    │ │  IVRLog   │ │  Wellness   │
       │─────────────│ │───────────│ │  Checkin    │
       │ hoursLogged │ │ callSid   │ │─────────────│
       │ notes       │ │ action    │ │ feeling     │
       │ gpsLocation │ │ language  │ │ sentiment   │
       └─────────────┘ └───────────┘ └─────────────┘
```

### Key Models

| Model | Description |
|-------|-------------|
| **User** | Admins, coordinators (email/password auth) |
| **Volunteer** | Field volunteers (phone-based auth, encrypted PII) |
| **Disaster** | Active disasters with location and status |
| **Task** | Work items assigned to volunteers |
| **TaskLog** | Activity tracking with GPS and hours |
| **WellnessCheckin** | Volunteer mental health tracking |
| **IVRLog** | Phone call interaction history |

### Enums

```typescript
UserRole: VOLUNTEER | NGO_COORDINATOR | DISASTER_ADMIN | SUPER_ADMIN
DisasterType: FLOOD | CYCLONE | EARTHQUAKE | LANDSLIDE | FIRE | OTHER
DisasterStatus: PLANNING | ACTIVE | RESOLVED | ARCHIVED
TaskStatus: OPEN | ASSIGNED | IN_PROGRESS | COMPLETED | CANCELLED
TaskUrgency: LOW | MEDIUM | HIGH | CRITICAL
```

---

## 6. API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login user | Public |
| POST | `/refresh` | Refresh access token | Token |
| POST | `/logout` | Logout user | Token |
| POST | `/volunteer/register` | Register volunteer (phone) | Public |
| POST | `/volunteer/login` | Volunteer OTP login | Public |

### Volunteers (`/api/volunteers`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all volunteers | Coordinator+ |
| GET | `/:id` | Get volunteer details | Self/Coordinator+ |
| PUT | `/:id` | Update volunteer | Self/Coordinator+ |
| POST | `/:id/location` | Update GPS location | Self |
| POST | `/:id/checkin` | Wellness check-in | Self |
| GET | `/:id/tasks` | Get assigned tasks | Self/Coordinator+ |

### Tasks (`/api/tasks`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List tasks (filtered) | Authenticated |
| POST | `/` | Create new task | Coordinator+ |
| GET | `/:id` | Get task details | Authenticated |
| PUT | `/:id` | Update task | Coordinator+ |
| POST | `/:id/assign` | Assign volunteer | Coordinator+ |
| POST | `/:id/complete` | Mark completed | Assigned Vol |
| POST | `/:id/log` | Log hours/progress | Assigned Vol |

### Disasters (`/api/disasters`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List disasters | Authenticated |
| POST | `/` | Create disaster | Admin |
| GET | `/:id` | Get disaster details | Authenticated |
| PUT | `/:id` | Update disaster | Admin |
| GET | `/:id/tasks` | Get disaster tasks | Authenticated |
| GET | `/:id/stats` | Get disaster statistics | Coordinator+ |

### Matching (`/api/matching`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/task/:id` | Find volunteers for task | Coordinator+ |
| GET | `/volunteer/:id` | Find tasks for volunteer | Self/Coordinator+ |
| POST | `/auto-assign/:taskId` | Auto-assign best match | Coordinator+ |
| GET | `/burnout-risks` | Get at-risk volunteers | Coordinator+ |

### IVR (`/api/ivr`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/incoming` | Handle incoming call | Twilio Webhook |
| POST | `/gather` | Handle DTMF input | Twilio Webhook |
| POST | `/status` | Call status callback | Twilio Webhook |

---

## 7. Core Services

### AuthService (`auth.service.ts`)
- User registration with bcrypt password hashing
- Volunteer phone-based registration with encryption
- JWT access/refresh token generation
- Token verification and refresh logic

### MatchingService (`matching.service.ts`)
AI-powered volunteer-task matching using weighted scoring:

```
Score = (SkillMatch × 40%) + (Proximity × 30%) + (Availability × 20%) + (Language × 10%)
```

- **Skill Matching**: Jaccard similarity index
- **Proximity**: Haversine distance calculation
- **Availability**: Burnout score penalties
- **Language**: Preferred language matching

### VolunteerService (`volunteer.service.ts`)
- Profile management
- Location updates
- Task history
- Wellness tracking

### TaskService (`task.service.ts`)
- CRUD operations
- Assignment logic
- Status transitions
- Hour logging

### DisasterService (`disaster.service.ts`)
- Disaster lifecycle management
- Statistics aggregation
- Geographic queries

### IVRService (`ivr.service.ts`)
- Twilio TwiML generation
- Voice menu flows
- DTMF input handling
- Multi-language support (EN, HI, TE, AS)

---

## 8. Authentication & Authorization

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Login   │────>│  Verify  │────>│  Generate│────>│  Return  │
│  Request │     │  Creds   │     │   JWT    │     │  Tokens  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘

Access Token: 15 min expiry (used in Authorization header)
Refresh Token: 7 day expiry (used to get new access token)
```

### Role-Based Access Control (RBAC)

```typescript
// Middleware usage
router.get('/admin-only', authenticate, requireRole('SUPER_ADMIN', 'DISASTER_ADMIN'), handler);
router.get('/coordinator+', authenticate, requireCoordinator, handler);
router.get('/self-or-admin', authenticate, requireOwnershipOrAdmin(req => req.params.id), handler);
```

| Role | Permissions |
|------|-------------|
| SUPER_ADMIN | Full system access |
| DISASTER_ADMIN | Manage disasters, tasks, volunteers |
| NGO_COORDINATOR | Manage tasks, view volunteers |
| VOLUNTEER | Self-profile, assigned tasks only |

### Security Features
- **Phone Encryption**: AES-256-GCM for PII
- **Phone Hashing**: SHA-256 for lookups
- **Password Hashing**: bcrypt with 12 rounds
- **Rate Limiting**: 100 req/15min per IP
- **Helmet**: Security headers
- **CORS**: Configurable origins

---

## 9. Key Features

### 1. AI-Powered Matching
- Considers skills, location, burnout, language
- Auto-assignment capability
- Match scoring with explanations

### 2. Burnout Prevention
- Wellness check-ins
- Sentiment analysis
- Automatic burnout risk detection
- Rest recommendations

### 3. Offline-First Support
- PWA with service workers
- Background sync
- Conflict resolution
- Local-first data storage

### 4. IVR System
- Feature phone support
- Multi-language menus
- Task updates via phone
- Hour logging via keypad

### 5. Real-Time Coordination
- Live task status
- GPS tracking
- Push notifications (planned)
- WebSocket updates (planned)

---

## 10. How to Run

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Quick Start (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/SevaSync.git
cd SevaSync

# 2. Start databases with Docker
docker-compose up -d postgres redis

# 3. Setup backend
cd backend
cp .env.example .env
npm install

# 4. Generate Prisma client & run migrations
npx prisma generate
npx prisma migrate dev

# 5. Seed the database (optional)
npm run prisma:seed

# 6. Start development server
npm run dev
```

### Full Docker Setup

```bash
# Start everything (backend + databases)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop everything
docker-compose down
```

### Verify Installation

```bash
# Health check
curl http://localhost:3000/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2026-03-25T...",
  "environment": "development"
}
```

### Available Scripts

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Compile TypeScript
npm run start        # Start production server
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run prisma:studio # Open Prisma database GUI
npm run prisma:seed   # Seed database with test data
```

---

## 11. Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database (Required)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sevasync?schema=public"

# Redis (Required)
REDIS_URL="redis://localhost:6379"

# JWT Secrets (Required - CHANGE IN PRODUCTION!)
ACCESS_TOKEN_SECRET="your-super-secret-access-token-key-min-32-chars"
REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key-min-32-chars"

# Encryption Key (Required - 64 hex chars = 32 bytes)
# Generate with: openssl rand -hex 32
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# Twilio IVR (Optional - for phone features)
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

# Server
PORT=3000
NODE_ENV="development"

# CORS
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"
```

### Generate Secrets

```bash
# Generate encryption key
openssl rand -hex 32

# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 12. Testing

### Run Tests

```bash
# All tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Specific file
npm test -- matching.service.test.ts
```

### Test Structure

```
tests/
├── setup.ts                    # Jest configuration
├── helpers/
│   ├── fixtures.ts            # Test data factories
│   └── integration.ts         # Integration test helpers
└── unit/
    ├── services/
    │   └── matching.service.test.ts
    └── utils/
        └── crypto.test.ts
```

### Current Test Coverage
- Matching Service: 24 tests (skill matching, distance, scoring)
- Crypto Utils: 15 tests (encryption, hashing, tokens)

---

## 13. Production Deployment

### Checklist

- [ ] Change all secrets (JWT, encryption key)
- [ ] Set `NODE_ENV=production`
- [ ] Configure production PostgreSQL
- [ ] Configure production Redis
- [ ] Setup Twilio production credentials
- [ ] Configure CORS for production domains
- [ ] Setup SSL/TLS termination
- [ ] Configure logging (Winston/Pino)
- [ ] Setup monitoring (Prometheus/Grafana)
- [ ] Configure backup strategy

### Docker Production Build

```dockerfile
# backend/Dockerfile.prod
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

### Recommended Production Stack

```
┌─────────────────────────────────────────────────────┐
│                   Load Balancer                      │
│                   (AWS ALB / Nginx)                  │
└─────────────────────────┬───────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │ Backend │       │ Backend │       │ Backend │
   │   #1    │       │   #2    │       │   #3    │
   └────┬────┘       └────┬────┘       └────┬────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼────┐     ┌─────▼─────┐    ┌────▼────┐
    │PostgreSQL│    │   Redis   │    │  Twilio │
    │ (RDS)   │     │ (Elasticache)│ │  API    │
    └─────────┘     └───────────┘    └─────────┘
```

---

## Test Credentials (Development)

After running `npm run prisma:seed`:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@sevasync.org | SevaSync2026! |
| Disaster Admin | disaster.admin@sevasync.org | SevaSync2026! |
| NGO Coordinator | coordinator@redcross.org | SevaSync2026! |

| Volunteer | Phone |
|-----------|-------|
| Rajesh Kumar | +919123456780 |
| Priya Sharma | +919123456781 |
| Mohammed Ali | +919123456782 |
| Lakshmi Iyer | +919123456783 |

---

## Support & Contributing

- **Issues**: GitHub Issues
- **Docs**: `/docs` folder
- **API Docs**: Swagger UI at `/api/docs` (planned)

---

*Report generated: March 25, 2026*
*Version: 1.0.0*
