# SevaSync Complete Testing Guide

**Version**: 1.0  
**Last Updated**: March 25, 2026  
**Status**: MVP Complete - Ready for Testing

---

## Quick Start

```bash
# 1. Start infrastructure
cd E:/Projects/SevaSync
docker compose up -d

# 2. Setup backend
cd backend
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev

# 3. Start PWA (separate terminal)
cd ../frontend-pwa
npm install
npm run dev

# 4. Start Dashboard (separate terminal)
cd ../frontend-dashboard
npm install
npm run dev
```

**Access Points**:
- Backend API: http://localhost:3000
- PWA (Volunteers): http://localhost:5173
- Dashboard (Coordinators): http://localhost:5174

---

## API Endpoint Summary (46 Total)

### Authentication (7 endpoints)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register coordinator/admin | None |
| POST | `/api/auth/register-volunteer` | Register volunteer (phone) | None |
| POST | `/api/auth/login` | Login coordinator/admin | None |
| POST | `/api/auth/login-volunteer` | Login volunteer | None |
| POST | `/api/auth/refresh` | Refresh access token | Refresh Token |
| GET | `/api/auth/me` | Get current user | JWT |
| GET | `/api/auth/volunteer/me` | Get volunteer profile | JWT |

### Volunteers (11 endpoints)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/volunteers` | List volunteers | JWT |
| GET | `/api/volunteers/nearby` | Find nearby (geospatial) | JWT |
| GET | `/api/volunteers/:id` | Get by ID | JWT |
| PATCH | `/api/volunteers/:id` | Update profile | JWT |
| POST | `/api/volunteers/:id/location` | Update GPS | JWT |
| POST | `/api/volunteers/me/checkin` | Wellness check-in | JWT |
| GET | `/api/volunteers/:id/tasks` | Task history | JWT |
| GET | `/api/volunteers/:id/wellness` | Wellness history | JWT |
| GET | `/api/volunteers/:id/stats` | Statistics | JWT |
| POST | `/api/volunteers/:id/deactivate` | Deactivate | Coordinator+ |
| POST | `/api/volunteers/:id/reactivate` | Reactivate | Coordinator+ |

### Tasks (11 endpoints)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/tasks` | Create task | Coordinator+ |
| GET | `/api/tasks` | List tasks | JWT |
| GET | `/api/tasks/nearby` | Find nearby | JWT |
| GET | `/api/tasks/:id` | Get by ID | JWT |
| PATCH | `/api/tasks/:id` | Update task | Coordinator+ |
| POST | `/api/tasks/:id/assign` | Assign volunteer | Coordinator+ |
| POST | `/api/tasks/:id/start` | Start task | Volunteer |
| POST | `/api/tasks/:id/complete` | Complete task | Volunteer |
| POST | `/api/tasks/:id/unassign` | Unassign | Coordinator+ |
| POST | `/api/tasks/:id/cancel` | Cancel task | Coordinator+ |
| GET | `/api/disasters/:id/tasks/stats` | Disaster task stats | JWT |

### Disasters (9 endpoints)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/disasters` | Create disaster | Admin+ |
| GET | `/api/disasters` | List disasters | JWT |
| GET | `/api/disasters/active` | Active disasters | JWT |
| GET | `/api/disasters/:id` | Get by ID | JWT |
| PATCH | `/api/disasters/:id` | Update disaster | Admin+ |
| POST | `/api/disasters/:id/activate` | Activate | Admin+ |
| POST | `/api/disasters/:id/resolve` | Resolve | Admin+ |
| POST | `/api/disasters/:id/archive` | Archive | Admin+ |
| GET | `/api/disasters/:id/stats` | Statistics | Coordinator+ |

### IVR (3 endpoints)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/ivr/incoming` | Exotel incoming call webhook | Exotel |
| POST | `/api/ivr/gather` | DTMF input handler | Exotel |
| POST | `/api/ivr/status` | Call status callback | Exotel |

### AI Matching (5 endpoints)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/matching/task/:taskId` | Volunteer matches for task | Coordinator+ |
| GET | `/api/matching/volunteer/:volunteerId` | Task matches for volunteer | JWT |
| POST | `/api/matching/task/:taskId/auto-assign` | AI auto-assignment | Coordinator+ |
| GET | `/api/matching/burnout-risks` | Burnout risk detection | Coordinator+ |
| POST | `/api/matching/score` | Calculate match score | Coordinator+ |

---

## Testing Scenarios

### 1. Basic Health Check
```bash
curl http://localhost:3000/health
```
Expected: `{"status":"ok"}`

### 2. Register and Login
```bash
# Register coordinator
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "name": "Test User",
    "role": "NGO_COORDINATOR"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Password123!"}'
```

### 3. AI Matching Test
```bash
# Get volunteer matches for a task
curl http://localhost:3000/api/matching/task/{taskId} \
  -H "Authorization: Bearer YOUR_TOKEN"

# Auto-assign best volunteer
curl -X POST http://localhost:3000/api/matching/task/{taskId}/auto-assign \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check burnout risks
curl http://localhost:3000/api/matching/burnout-risks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Geospatial Query Test
```bash
# Find volunteers within 10km of Mumbai
curl "http://localhost:3000/api/volunteers/nearby?latitude=19.0760&longitude=72.8777&radiusKm=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. IVR Flow Test (Exotel)
Configure Exotel webhooks to point to:
- Incoming: `https://your-domain/api/ivr/incoming`
- Gather: `https://your-domain/api/ivr/gather`
- Status: `https://your-domain/api/ivr/status`

---

## Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| VOLUNTEER | View tasks, update own profile, submit check-ins |
| NGO_COORDINATOR | Above + manage tasks, view volunteers |
| DISASTER_ADMIN | Above + manage disasters |
| SUPER_ADMIN | Full access |

---

## Frontend Testing

### PWA (Volunteers)
1. Open http://localhost:5173
2. Login with volunteer phone number
3. View available tasks
4. Test offline mode (disable network)
5. Check that tasks load from IndexedDB
6. Re-enable network and verify sync

### Dashboard (Coordinators)
1. Open http://localhost:5174
2. Login with coordinator credentials
3. Navigate to Disasters page - create/view disasters
4. Navigate to Tasks page - create/assign tasks
5. Navigate to Volunteers page - view map, filter volunteers

---

## Troubleshooting

### Database Issues
```bash
# Reset database
cd backend
npm run prisma:migrate -- reset
npm run prisma:seed
```

### Port Conflicts
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### Docker Issues
```bash
docker compose down
docker compose up -d
docker compose logs -f
```

---

## Security Notes

1. **Phone Encryption**: AES-256-GCM (stored) + SHA-256 (indexed)
2. **JWT Tokens**: 
   - Access: 15 min
   - Refresh: 7 days
   - Volunteer: 30 days
3. **Rate Limiting**: 100 req/15 min (IVR excluded)
4. **CORS**: Configured for localhost dev

---

## Test Data (After Seeding)

**Users**:
- admin@sevasync.org (SUPER_ADMIN)
- disaster.admin@sevasync.org (DISASTER_ADMIN)
- coordinator@redcross.org (NGO_COORDINATOR)

**Volunteers** (phone login):
- +919123456780 (Rajesh Kumar)
- +919123456781 (Priya Sharma)
- +919123456782 (Mohammed Ali)
- +919123456783 (Lakshmi Iyer)

**Disasters**:
- Mumbai Monsoon Floods 2026 (ACTIVE)
- Cyclone Vardah 2026 (ACTIVE)
- Delhi Heatwave 2026 (PLANNING)

---

## Next Steps

1. Run test scenarios above
2. Verify all endpoints work
3. Test PWA offline functionality
4. Test dashboard CRUD operations
5. Configure Exotel sandbox for IVR testing
