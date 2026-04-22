# SevaSync

> **Disaster-Resilient Volunteer Coordination Platform for India**

SevaSync is a full-stack platform designed for India's disaster response context, enabling seamless coordination of volunteers through multi-modal access: IVR for feature phones, offline-first PWA for smartphones, and web dashboard for coordinators.

**Status**: MVP Complete | March 2026

---

## Features

- **IVR System**: Feature phone access via Exotel for low-literacy, no-internet users
- **Offline-First PWA**: Works 100% offline with IndexedDB and sync queue
- **Admin Dashboard**: Real-time maps, task management, volunteer tracking
- **AI Skill Matching**: Intelligent volunteer-task matching (skills + proximity + burnout)
- **Burnout Detection**: Track volunteer wellness and prevent exhaustion
- **Multi-Language**: English and Hindi support (extensible)

---

## Architecture

```
┌─────────────────── CLIENT LAYER ───────────────────┐
│  IVR (Exotel)  │  Offline PWA  │  Admin Dashboard  │
│   (Feature     │  (Smartphones) │  (Coordinators)  │
│    Phones)     │                │                  │
└────────────────┼────────────────┼──────────────────┘
                 │                │
            Express.js + TypeScript Backend
                 │
     ┌───────────┼───────────────┐
 PostgreSQL    Redis Cache    (Future: S3)
 (Prisma ORM)
```

---

## Project Structure

```
SevaSync/
├── backend/                    # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic
│   │   ├── routes/             # API endpoints
│   │   ├── middleware/         # Auth, RBAC, validation
│   │   ├── types/              # Zod schemas
│   │   ├── utils/              # Crypto, JWT, Prisma
│   │   └── server.ts           # Entry point
│   └── prisma/
│       ├── schema.prisma       # Database schema (8 models)
│       └── seed.ts             # Test data
├── frontend-pwa/               # React + Vite + PWA
│   └── src/
│       ├── pages/              # Login, Tasks, Profile
│       ├── hooks/              # useAuth, useTasks, useSync
│       └── lib/                # IndexedDB, API client
├── frontend-dashboard/         # React + Vite
│   └── src/
│       ├── pages/              # Dashboard, Disasters, Tasks, Volunteers
│       ├── components/         # Layout, Maps
│       └── lib/                # API client, Auth context
├── docs/                       # Documentation
├── docker-compose.yml          # PostgreSQL + Redis
└── README.md
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### Installation

```bash
# 1. Clone and enter directory
cd SevaSync

# 2. Start PostgreSQL and Redis
docker compose up -d

# 3. Setup backend
cd backend
npm install
cp .env.example .env  # Edit with your settings
npm run prisma:migrate
npm run prisma:seed
npm run dev

# 4. Setup PWA (new terminal)
cd frontend-pwa
npm install
npm run dev

# 5. Setup Dashboard (new terminal)
cd frontend-dashboard
npm install
npm run dev
```

### Access Points

| Service | URL | Users |
|---------|-----|-------|
| Backend API | http://localhost:3000 | All |
| PWA | http://localhost:5173 | Volunteers |
| Dashboard | http://localhost:5174 | Coordinators |

---

## API Endpoints (46 Total)

### Authentication (7)
```
POST /api/auth/register           # Register coordinator
POST /api/auth/register-volunteer # Register volunteer (phone)
POST /api/auth/login              # Login coordinator
POST /api/auth/login-volunteer    # Login volunteer
POST /api/auth/refresh            # Refresh token
GET  /api/auth/me                 # Current user
GET  /api/auth/volunteer/me       # Current volunteer
```

### Volunteers (11)
```
GET    /api/volunteers            # List volunteers
GET    /api/volunteers/nearby     # Geospatial search
GET    /api/volunteers/:id        # Get by ID
PATCH  /api/volunteers/:id        # Update
POST   /api/volunteers/:id/location   # Update GPS
POST   /api/volunteers/me/checkin     # Wellness check-in
GET    /api/volunteers/:id/tasks      # Task history
GET    /api/volunteers/:id/wellness   # Wellness history
GET    /api/volunteers/:id/stats      # Statistics
POST   /api/volunteers/:id/deactivate # Deactivate
POST   /api/volunteers/:id/reactivate # Reactivate
```

### Tasks (11)
```
POST   /api/tasks                 # Create task
GET    /api/tasks                 # List tasks
GET    /api/tasks/nearby          # Geospatial search
GET    /api/tasks/:id             # Get by ID
PATCH  /api/tasks/:id             # Update
POST   /api/tasks/:id/assign      # Assign volunteer
POST   /api/tasks/:id/start       # Start task
POST   /api/tasks/:id/complete    # Complete task
POST   /api/tasks/:id/unassign    # Unassign
POST   /api/tasks/:id/cancel      # Cancel
GET    /api/disasters/:id/tasks/stats # Task stats
```

### Disasters (9)
```
POST   /api/disasters             # Create disaster
GET    /api/disasters             # List disasters
GET    /api/disasters/active      # Active only
GET    /api/disasters/:id         # Get by ID
PATCH  /api/disasters/:id         # Update
POST   /api/disasters/:id/activate   # Activate
POST   /api/disasters/:id/resolve    # Resolve
POST   /api/disasters/:id/archive    # Archive
GET    /api/disasters/:id/stats      # Statistics
```

### IVR (3)
```
POST   /api/ivr/incoming          # Exotel incoming call
POST   /api/ivr/gather            # DTMF input handler
POST   /api/ivr/status            # Call status callback
```

### AI Matching (5)
```
GET    /api/matching/task/:id            # Volunteer matches for task
GET    /api/matching/volunteer/:id       # Task matches for volunteer
POST   /api/matching/task/:id/auto-assign # Auto-assign best match
GET    /api/matching/burnout-risks       # Burnout detection
POST   /api/matching/score               # Calculate match score
```

---

## Role-Based Access Control

| Role | Permissions |
|------|-------------|
| VOLUNTEER | View tasks, update self, check-ins |
| NGO_COORDINATOR | + Manage tasks, view volunteers |
| DISASTER_ADMIN | + Manage disasters |
| SUPER_ADMIN | Full access |

---

## Security

- **Phone Encryption**: AES-256-GCM (stored) + SHA-256 (indexed lookup)
- **JWT Tokens**: Access (15min), Refresh (7 days), Volunteer (30 days)
- **Rate Limiting**: 100 requests/15 min per IP (IVR excluded)
- **RBAC**: 4-tier role system
- **Validation**: Zod schemas on all inputs

---

## Database Schema

8 Prisma models:
- `User` - Coordinators and admins
- `Volunteer` - Phone-based volunteers
- `Disaster` - Disaster events
- `Task` - Tasks within disasters
- `TaskLog` - Task activity audit
- `WellnessCheckin` - Volunteer wellness
- `IVRLog` - IVR call tracking

---

## AI Matching Algorithm

Weighted scoring (0-100):
- **Skill Similarity**: 40% (Jaccard index)
- **Distance**: 30% (Haversine formula)
- **Availability/Burnout**: 20%
- **Language Match**: 10%

Burnout thresholds:
- Warning: Score >= 5
- Critical: Score >= 7 (excluded from auto-assign)

---

## IVR Flow (Exotel)

```
Incoming Call
    │
    ├─> Language Selection (1=Hindi, 2=English)
    │
    ├─> Main Menu
    │   ├─> 1: Get nearby tasks
    │   ├─> 2: Accept task
    │   ├─> 3: Complete task
    │   └─> 4: Wellness check-in
    │
    └─> Response (TTS in selected language)
```

---

## Offline-First PWA

- IndexedDB for local task storage
- Sync queue for pending actions
- Auto-sync when online
- Service worker for caching
- Works completely offline

---

## Development

```bash
# Backend
cd backend
npm run dev           # Development server
npm run build         # Production build
npm run prisma:studio # Database GUI

# Frontend
cd frontend-pwa      # or frontend-dashboard
npm run dev          # Development server
npm run build        # Production build
```

---

## Testing

See `docs/TESTING_GUIDE.md` for comprehensive testing scenarios.

```bash
# Quick health check
curl http://localhost:3000/health

# Test AI matching
curl http://localhost:3000/api/matching/burnout-risks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Test Data (After Seeding)

**Coordinators**:
- admin@sevasync.org (SUPER_ADMIN)
- coordinator@redcross.org (NGO_COORDINATOR)

**Volunteers** (phone login):
- +919123456780 (Rajesh Kumar)
- +919123456781 (Priya Sharma)

**Disasters**:
- Mumbai Monsoon Floods 2026 (ACTIVE)
- Cyclone Vardah 2026 (ACTIVE)

---

---

## 📚 Documentation

Complete documentation is organized in the `/docs` folder with dedicated subfolders for easy navigation:

### 📖 Main Index
- **[Documentation Index](docs/README.md)** - Complete navigation guide with reading paths by role

### 📊 Development Progress (Daily Reports)
Located in `/docs/reports/`:
- **[Day 1-8 Reports](docs/reports/)** - Chronological development progress
- **[Day 8 Completion Report](docs/reports/DAY_8_COMPLETION_REPORT.md)** - Latest features ⭐
- **[Day 5 Quick Reference](docs/reports/DAY_5_QUICK_REFERENCE.md)** - Maps & geo features

### 🏗️ Technical Guides
Located in `/docs/guides/`:
- **[01. Exploration Summary](docs/guides/01_EXPLORATION_SUMMARY.md)** - Project analysis
- **[02. Auth Architecture](docs/guides/02_AUTH_ARCHITECTURE.md)** - System design
- **[03. Codebase Analysis](docs/guides/03_CODEBASE_ANALYSIS.md)** - Code structure
- **[04. Demo Checklist](docs/guides/04_DEMO_CHECKLIST.md)** - Validation points
- **[05. Demo Scenario](docs/guides/05_DEMO_SCENARIO.md)** - Guided walkthrough
- **[06. Frontend Map Analysis](docs/guides/06_FRONTEND_MAP_ANALYSIS.md)** - Map features
- **[07. Geo Infrastructure](docs/guides/07_GEO_INFRASTRUCTURE_ANALYSIS.md)** - Infrastructure
- **[08. Maps Implementation](docs/guides/08_MAPS_IMPLEMENTATION.md)** - Map integration

### 📦 Archives (Historical Reference)
Located in `/docs/archive/`:
- Complete phase reports and testing guides from earlier development stages

### 🎯 Reading Paths
- **New developers**: Start with [DAY_1_REPORT](docs/reports/DAY_1_REPORT.md) → [CODEBASE_ANALYSIS](docs/guides/03_CODEBASE_ANALYSIS.md)
- **Quick overview**: [DAY_8_COMPLETION_REPORT](docs/reports/DAY_8_COMPLETION_REPORT.md)
- **Demo prep**: [DEMO_CHECKLIST](docs/guides/04_DEMO_CHECKLIST.md) → [DEMO_SCENARIO](docs/guides/05_DEMO_SCENARIO.md)
- **Maps features**: [MAPS_IMPLEMENTATION](docs/guides/08_MAPS_IMPLEMENTATION.md)

---

## License

MIT License

---

**Built for disaster resilience in India**
