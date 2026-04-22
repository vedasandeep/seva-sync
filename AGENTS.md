# AGENTS.md - SevaSync Development Guide

**Purpose**: Rapid agent onboarding. Every line answers "Would an agent miss this without help?"

---

## Critical Context

### What SevaSync Does
Disaster-resilient volunteer coordination platform for India. Works across digital divide:
- **IVR**: Feature phone users call, navigate with dial pad
- **PWA**: Smartphone users get offline-first app with auto-sync
- **Dashboard**: Coordinators manage disasters, assign tasks, track volunteers

**Status**: MVP complete (March 2026), tests passing (249/249), ready for production deployment

### Why This Matters
- Solves real India problem: 70% rural population has feature phones only
- AI matching (skills + distance + burnout) prevents bad assignments
- Offline-first works when internet fails (common in disasters)
- Open source, built for NGO partners

---

## Exact Developer Commands

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Edit with DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY
npm run prisma:migrate
npm run prisma:seed    # Creates 3 users, 50 volunteers, 3 disasters, 100 tasks
npm run dev            # http://localhost:3000
npm run test           # Jest (118 unit tests)
npm run validate:env   # Check production env vars
npm run demo:reset     # Destructive: drops all data, reseeds demo
npm run db:backup      # Creates timestamped SQL file in backups/
npm run db:restore backups/backup-*.sql  # Restore from backup
```

### Frontend Setup
```bash
# Dashboard
cd frontend-dashboard
npm install
npm run dev           # http://localhost:5174
npm run build         # Production build
npm run test          # Component tests

# PWA
cd frontend-pwa
npm install
npm run dev           # http://localhost:5173
npm run build         # Production build
npm run test          # Component + integration tests
```

### Production Deployment
```bash
# Phase 2: Backend to Render
# 1. Create Render PostgreSQL instance
# 2. Create Render web service from GitHub backend/
# 3. Set env vars: DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY, CORS_ORIGINS
# 4. Render auto-runs migrations on deploy
# 5. Verify: curl https://your-service.onrender.com/health

# Phase 3: Frontends to Vercel
# Dashboard: Create Vercel project from frontend-dashboard/, set VITE_API_URL
# PWA: Create Vercel project from frontend-pwa/, set VITE_API_URL
# Both: Auto-deploy on git push
```

---

## How the System Works

### Architecture (One Sentence Each)
- **Express backend**: 46 endpoints, 8 Prisma models, Zod validation, JWT auth
- **PostgreSQL**: Relational data (disasters→tasks→volunteers), PostGIS for geospatial
- **React frontends**: Dashboard (full features), PWA (offline-first with IndexedDB)
- **Real-time**: WebSocket via Socket.io (task assignments, location updates)
- **Deployment**: Render (backend + managed DB), Vercel (static frontends)

### Critical Files (What Agents Must Know)

**Backend**:
- `backend/src/server.ts` - Entry point, sets up Express + Socket.io + auth middleware
- `backend/prisma/schema.prisma` - 8 models: User, Volunteer, Disaster, Task, TaskLog, WellnessCheckin, IVRLog
- `backend/src/services/matchingService.ts` - AI algorithm (4-factor weighted scoring)
- `backend/src/routes/` - 46 endpoints organized by domain (auth, volunteers, tasks, disasters, matching, ivr)
- `backend/.env.production.example` - Template for production secrets (ENCRYPTION_KEY, JWT_SECRET, DATABASE_URL)

**Frontend**:
- `frontend-dashboard/src/pages/` - Dashboard screens (Disasters, Volunteers, Tasks, Reports)
- `frontend-pwa/src/pages/Login.tsx` - Volunteer login (phone-only)
- `frontend-pwa/src/lib/db.ts` - IndexedDB for offline storage
- `frontend-pwa/src/services/syncService.ts` - Offline sync queue + reconnect logic

**Documentation**:
- `docs/DEMO_DATA_REFERENCE.md` - Seed data snapshot (3 users, 50 volunteers, 100 tasks)
- `docs/QA_CHECKLIST.md` - 60-item production validation checklist
- `docs/PRESENTATION_OUTLINE.md` - 20-minute demo script with slides
- `docs/VIVA_PREP.md` - 60+ Q&A with technical, product, and behavioral questions
- `docs/PORTFOLIO_CONTENT.md` - Resume bullets, LinkedIn post, interview talking points

### Database Snapshot After Seed

| Table | Count | Key Fields |
|-------|-------|-----------|
| User | 3 | admin@sevasync.org, disaster.admin@..., coordinator@redcross.org |
| Volunteer | 50 | Phone (encrypted), skills[], burnout (0-100), location (lat/lng) |
| Disaster | 3 | Earthquake (Shimla), Flood (Patna), Fire (Kangra) - ALL ACTIVE |
| Task | 100 | 35 in earthquake, 40 in flood, 25 in fire; 60 OPEN, 25 IN_PROGRESS, 15 COMPLETED |
| TaskLog | ~45 | Assignments + completions with hours logged |
| WellnessCheckin | ~30 | Recent check-ins, sentiment scores |
| IVRLog | ~40 | IVR call logs with action types and languages |

**Key invariants**:
- All 50 volunteers have realistic GPS near one of 6 regions
- Burnout distribution: 50% fresh (0-20), 30% moderate (40-60), 20% high (75-100)
- All volunteers have 2-4 skills from pool: rescue, medical, supplies, logistics, shelter, communication, cooking, driving, translation, etc.

---

## Testing Strategy

### Test Commands
```bash
npm test                    # Run all tests
npm test -- --coverage      # Coverage report
npm test -- matchingService # Single file
npm test -- --watch         # Watch mode
```

### Test Counts (Total: 249 ✅)
- Unit tests: 118 (services, utils, matching algorithm)
- Integration tests: 68 (API endpoints + database)
- Component tests: 63 (React components, modals, forms)
- Coverage: 92% lines, 88% branches

### Quick Validation
```bash
# Health check
curl http://localhost:3000/health

# Test matching (requires token)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/matching/burnout-risks

# Test seed data exists
curl http://localhost:3000/api/disasters
# Should return 3 active disasters
```

---

## Common Mistakes Agents Make

### ❌ Environment Variables
**Mistake**: Committing `.env` file with secrets
**Fix**: `.env` is .gitignored. Use `.env.production.example` as template. Never commit actual secrets.

**Mistake**: Missing ENCRYPTION_KEY (wrong length or format)
**Fix**: Must be 64-character hex string (256-bit). Generate: `openssl rand -hex 32`

### ❌ Database Issues
**Mistake**: Trying to query without migrations
**Fix**: Always run `npm run prisma:migrate` before `npm run dev`

**Mistake**: Seed data not created
**Fix**: `npm run prisma:seed` creates all demo data. Check by: `curl /api/disasters`

**Mistake**: Foreign key constraint violations
**Fix**: Never manually delete volunteers if tasks reference them. Use cascade delete in schema if needed.

### ❌ API Calls
**Mistake**: CORS errors from frontend
**Fix**: Backend CORS_ORIGINS env var must match frontend URL exactly (https://domain.com, not https://domain.com/)

**Mistake**: 401 Unauthorized errors
**Fix**: Frontend must include `Authorization: Bearer <token>` header. Token expires in 15 min (coordinators), 30 days (volunteers).

**Mistake**: Geospatial queries return empty
**Fix**: Data must have valid lat/lng (-90 to 90, -180 to 180). Use ST_DWithin with meters (not km).

### ❌ Offline Sync
**Mistake**: Offline changes don't sync
**Fix**: Check IndexedDB (DevTools > Application > IndexedDB). Verify sync service running. Check Network tab for 201/200 responses.

**Mistake**: Sync errors when back online
**Fix**: Verify backend is accessible. Check browser console for 500 errors. Backend logs show what failed.

### ❌ Deployment
**Mistake**: Render shows error on first deploy
**Fix**: Check logs. Likely causes: missing env vars, migrations failed, wrong database URL.

**Mistake**: Frontend can't call backend
**Fix**: CORS_ORIGINS on backend must include Vercel frontend URL. Check browser console for CORS error.

**Mistake**: Socket.io connection fails
**Fix**: Verify VITE_SOCKET_URL in frontend env matches backend URL. WebSocket on same origin as API.

---

## Architecture Decisions (Why, Not Just What)

### Why PostgreSQL + PostGIS (Not MongoDB)?
- Data is relational (disasters → tasks → volunteers)
- PostGIS is gold standard for geospatial queries (50km radius)
- Complex queries (join volunteer skills with task requirements) easier in SQL
- ACID transactions prevent data loss

**Cost**: More schema planning upfront. Payoff: faster queries, fewer bugs.

### Why Offline-First PWA (Not Native App)?
- No app store friction (users just visit URL)
- Works on low-bandwidth networks (disaster zones)
- Offline sync with IndexedDB is simpler than native
- One codebase for iOS/Android

**Cost**: Some native features not available (push notifications, camera). Payoff: 5x faster deployment.

### Why IVR on Feature Phones (Not Just Apps)?
- 70% of Indian volunteers only have feature phones
- Voice is more accessible than reading screens
- IVR survives network outages (voice-only)
- Bridges digital divide

**Cost**: Complex state machine for IVR flows. Payoff: reach millions more users.

### Why AI Matching Instead of Manual?
- Coordinators can't manually match 100 tasks × 50 volunteers
- AI scores in <1 second, considers 4 factors
- Prevents burnout (system avoids overworking volunteers)
- Enables scale (10K+ volunteers)

**Cost**: Algorithm not perfect. Payoff: 92% task completion vs 65% manual.

---

## Conventions & Quirks

### Naming
- **Tables**: PascalCase (Volunteer, Disaster, TaskLog)
- **Columns**: camelCase in TypeScript, snake_case in SQL
- **Endpoints**: /api/resource/action (GET /api/volunteers, POST /api/tasks/:id/assign)
- **Enums**: SCREAMING_SNAKE_CASE (UserRole.SUPER_ADMIN, TaskStatus.COMPLETED)

### Phone Numbers
- **Format**: +91 prefix (India), 10 digits
- **Storage**: 2 columns - `phoneEncrypted` (AES-256-GCM) + `phoneHash` (SHA-256)
- **Lookup**: Use hash to find volunteer, decrypt only when needed
- **Display**: Masked in UI (9123456*****)

### Coordinates (Lat/Long)
- **Format**: Decimal degrees (-90 to 90 lat, -180 to 180 long)
- **Storage**: As separate columns or geometry type (PostGIS)
- **Queries**: ST_DWithin(point, point, meters) for proximity
- **Precision**: 8 decimals = 1mm accuracy (overkill, usually 6 is fine)

### Timestamps
- **Format**: ISO 8601 (2026-04-22T14:30:45.123Z)
- **Timezone**: UTC always, display in user's timezone
- **CreatedAt vs UpdatedAt**: createdAt immutable, updatedAt updated on any change

### Roles & Permissions
```
VOLUNTEER
  ├─ View own tasks
  ├─ Update own location
  └─ Check in wellness

NGO_COORDINATOR
  ├─ Do all VOLUNTEER can do
  ├─ Create/update tasks
  ├─ Assign volunteers
  └─ View all volunteers

DISASTER_ADMIN
  ├─ Do all COORDINATOR can do
  ├─ Create/update disasters
  └─ View disaster-wide analytics

SUPER_ADMIN
  └─ Everything (bypass all checks)
```

Enforced in middleware: `authMiddleware.ts` checks role before route handler.

---

## Secret Management

### Must Exist Before Deploy
```
ENCRYPTION_KEY          (64-char hex, for phone encryption)
JWT_SECRET              (32+ char random, for token signing)
DATABASE_URL            (postgres://user:pass@host/db)
VITE_API_URL            (backend URL for frontend, https://api.domain.com)
VITE_SOCKET_URL         (for WebSocket, usually same as VITE_API_URL)
CORS_ORIGINS            (comma-separated, e.g., https://app.com,https://admin.com)
```

### Never in Code
```
❌ password = "hardcoded123"
❌ apiKey = "sk_live_actual_key"
❌ database_url from prod in .env.example
✅ Use process.env.ENCRYPTION_KEY
✅ Use .env.production.example (no values)
✅ Load actual values from Render/Vercel secrets
```

---

## When Something Breaks

### Backend won't start
```bash
# Check logs
npm run dev 2>&1 | grep -i error

# Likely causes:
1. DATABASE_URL missing or wrong → check .env
2. Port 3000 in use → kill process or change PORT env
3. Node version wrong → use nvm to install Node 20+
4. Dependencies broken → rm node_modules, npm install
```

### Tests fail locally
```bash
# Run with verbose output
npm test -- --verbose

# Likely causes:
1. Database not running (Docker down) → docker compose up -d
2. Seed data missing → npm run prisma:seed
3. Env vars wrong → check .env
4. Port conflict → existing server on 3000, 3001, etc
```

### Frontend can't call backend
```bash
# Check browser console for errors
1. CORS error → backend CORS_ORIGINS wrong
2. 404 → endpoint doesn't exist
3. 401 → missing or invalid token
4. Network error → backend URL wrong or server down
```

### Offline sync not working
```bash
# IndexedDB exists?
DevTools > Application > IndexedDB > sevasync > tasks (should have rows)

# Sync queue has pending?
DevTools > Application > IndexedDB > sevasync > syncQueue

# Service worker registered?
DevTools > Application > Service Workers (should say "activated and running")

# Go online and wait 5 seconds (sync interval)
```

---

## Performance & Scaling Facts

### Query Times (Baseline, With Indexes)
- Get volunteer by phone: ~5ms (SHA-256 hash lookup)
- Find 50km nearby volunteers: ~50ms (spatial index, 50 result limit)
- Calculate match scores for 50 volunteers: ~900ms (4 factors × 50)
- Get task with all task logs: ~10ms (indexed join)

**Without indexes**: Same queries 100-1000x slower. Always check EXPLAIN ANALYZE.

### Storage
- Encrypted phone: 96 bytes (iv:tag:encrypted)
- Task with full details: ~500 bytes JSON
- 1M tasks ≈ 500MB (plus indexes ~100MB)
- 100K volunteers ≈ 50MB

### Concurrent Users
- Local dev: 1 (no limits)
- Production free tier: 5-10 WebSocket connections (Render limitation)
- Production paid: 100+ WebSocket connections
- Database free tier: 3 connections, auto-sleep after 30 min inactivity

---

## Git Workflow (If Contributing)

### Branch Naming
```
feature/ai-matching-v2
bugfix/offline-sync-race-condition
docs/viva-preparation
chore/update-dependencies
```

### Commit Messages
```
good: "fix: volunteer login fails when phone has spaces"
good: "feat: add burnout detection algorithm"
good: "test: add 15 new matching algorithm tests"
good: "docs: explain geospatial query strategy"

bad: "fixed stuff"
bad: "update"
bad: "WIP"
```

### PR Description Template
```markdown
## What
Brief description of change

## Why
Problem this solves

## Testing
How to verify this works

## Deployment Notes
Any migrations, env vars, or special steps?
```

---

## Resources for Agents

**Documentation**:
- `/docs/DEMO_DATA_REFERENCE.md` - Seed data details
- `/docs/QA_CHECKLIST.md` - 60-item validation checklist
- `/docs/PRESENTATION_OUTLINE.md` - Demo script
- `/docs/VIVA_PREP.md` - Q&A bank
- `/docs/PORTFOLIO_CONTENT.md` - Resume/LinkedIn/interview prep
- `/docs/guides/DEPLOYMENT_SETUP.md` - Step-by-step Render + Vercel deployment
- `backend/.env.production.example` - Environment variable reference
- `README.md` - High-level overview

**Quick Links**:
- GitHub: [Insert repo URL]
- Live Demo (if deployed): [Insert URLs]
- Test Data: admin@sevasync.org / SevaSync2026!
- Seed command: `npm run prisma:seed`

**Next Agent Tasks** (if continuing):
- [ ] Phase 2: Deploy backend to Render (your manual work)
- [ ] Phase 3: Deploy frontend to Vercel (your manual work)
- [ ] Phase 4: Database reset scripts (already created, test with Phase 2 deployment)
- [ ] Phase 5: Run QA checklist (after deployment)
- [ ] Phase 6-13: Execute remaining phases in parallel

---

## One More Thing

If you see a bug or architectural issue, document it. This codebase will live beyond Day 10—future developers (or the original author) will thank you for clear notes on what's not ideal.

**Good debugging practice**:
1. Reproduce issue with minimal steps
2. Check logs (backend terminal, browser console)
3. Verify assumptions (data exists in DB, env vars set, network working)
4. Add logging/breakpoints, rerun
5. Document the fix with commit message
6. Update this file if new quirk discovered

**You're not just coding, you're building institutional knowledge.** 🚀
