# SevaSync Viva Preparation - Q&A Bank

**Purpose**: Prepare for verbal examination/defense of SevaSync
**Difficulty Levels**: Beginner → Intermediate → Advanced → Security/Deployment
**Total Questions**: 60+
**Preparation Time**: Read through, memorize key answers, practice aloud

---

## How to Use This Document

1. **Read all Q&A once** to understand the scope
2. **Identify weak areas** - drill those more
3. **Practice aloud** - say answers out loud (not just reading)
4. **Mock interviews** - have someone ask random questions
5. **Time yourself** - aim for 1-2 min per answer

**Grading Criteria** (typical):
- Correctness (60%) - Answer is technically right
- Clarity (20%) - Explain so anyone understands
- Completeness (20%) - Cover edge cases, tradeoffs

---

## SECTION 1: BASIC UNDERSTANDING (Beginner - Should Know)

These questions establish that you understand the basic problem and solution.

### 1.1 What problem does SevaSync solve?

**Expected Answer** (2-3 sentences):
SevaSync solves the problem of coordinating volunteers during disasters in India, specifically across the digital divide. Many volunteers in rural areas use feature phones (not smartphones) and have unreliable internet. Existing coordination platforms assume everyone has 4G, so they don't work. SevaSync provides three access methods (IVR for feature phones, PWA for smartphones, web dashboard for coordinators) so everyone can participate regardless of device or connectivity.

**Why Asked**: 
- Shows understanding of domain problem
- Demonstrates you thought about real constraints
- Differentiates from generic volunteer platforms

**Follow-ups They Might Ask**:
- "Why focus on India specifically?" - Answer: High disaster frequency, large rural population with feature phones
- "Who are the users?" - Answer: Volunteers (low-tech), coordinators (tech-savvy), NGOs

---

### 1.2 What are the three main access channels?

**Expected Answer** (with examples):
1. **IVR (Interactive Voice Response)** - Feature phone users call a number, navigate with dial pad (press 1 for Hindi, 2 for English). Get tasks, log hours, wellness check-in. Works 100% offline (voice-only).

2. **PWA (Progressive Web App)** - Smartphone users visit a web URL, full app experience. Can work offline with IndexedDB sync. Real-time notifications, location tracking, task management.

3. **Admin Dashboard** - Web browser, for coordinators/admins. Create tasks, assign volunteers, view maps, analytics, reports.

**Why Asked**: 
- Core innovation - accessibility
- Shows architectural thinking

**Visual Aid**:
```
Feature Phone → IVR (Call-based)
Smartphone → PWA (App-like, offline-first)  
Computer → Dashboard (Full features)
```

---

### 1.3 Explain the AI matching algorithm in simple terms.

**Expected Answer** (1.5-2 minutes):
When a coordinator creates a task, the system automatically scores every available volunteer on a scale of 0-100. The score considers four factors:

1. **Skill Match (40%)** - Does the volunteer have the required skills? If task needs "rescue" skill and volunteer has it, they score higher. We use Jaccard index for overlap calculation.

2. **Distance (30%)** - How far is the volunteer from the task? We calculate using Haversine formula. Closer volunteers score higher.

3. **Availability/Burnout (20%)** - Is the volunteer available? How exhausted are they? Fresh volunteers (burnout 0-20) score better than burnt-out ones (75-100). Unavailable volunteers excluded entirely.

4. **Language (10%)** - Does the volunteer speak the task's language? If task needs Hindi-speaking volunteer, Hindi speakers score higher.

The algorithm weights these factors and produces a final score. The highest-scoring volunteer is recommended to the coordinator (or auto-assigned if coordinator allows).

**Example**:
```
Task: Medical Relief Camp (Patna, needs Hindi speaker)
Volunteer 1: Medical skill ✓, 2km away ✓, available ✓, burnout 30 ✓ → 92/100
Volunteer 2: Medical skill ✓, 5km away, partially available, burnout 50 → 78/100
Volunteer 3: No medical skill, closest (1km), available but burnout 85 → 45/100
```

**Why Asked**: 
- Core innovation
- Shows algorithmic thinking

**Follow-ups**:
- "Why weight skills 40% instead of equal?" - Answer: Skill mismatch causes task failure; proximity can be solved by reassignment
- "What if no good matches exist?" - Answer: Show lowest-scoring match with warning
- "How fast?" - Answer: < 1 second for 50 volunteers

---

### 1.4 What is burnout detection and why does it matter?

**Expected Answer** (1.5-2 minutes):
Burnout detection is the system's way of protecting volunteers from overwork. During disasters, volunteers often push themselves too hard and become exhausted, which leads to:
- Poor decision-making
- Emotional fatigue
- Health issues
- Permanent dropout from volunteering

SevaSync tracks a **Burnout Score (0-100)** using multiple signals:

1. **Wellness check-ins** - Every 24 hours, volunteers report feeling good/tired/exhausted/stressed. Sentiment scores added up over time.

2. **Task completion rate** - How many tasks completed recently? Too many = exhaustion.

3. **Time between tasks** - Rest time. Less rest = higher burnout.

4. **Activity patterns** - Is volunteer online 24/7? Sleeping? Both indicate fatigue.

**Score Interpretation**:
- 0-20 (Fresh): Optimal, can assign more tasks
- 40-60 (Moderate): Monitor, show warning to coordinator
- 75-100 (Critical): Cannot auto-assign, manual override required

**Example**: If volunteer logs 15 tasks in 2 days, 60+ hours worked, wellness check-in says "exhausted" → burnout score jumps to 80 → system excludes from auto-assign → coordinator sees red flag.

**Why Matters**:
- Prevents volunteer attrition
- Improves task completion (rested volunteers work better)
- Shows we care about volunteers as humans, not just resources
- Real NGOs report 40% fewer dropouts with burnout awareness

**Follow-ups**:
- "How do you measure sentiment?" - Answer: Keyword analysis, sentiment model, or simple scoring
- "What if coordinator ignores warning?" - Answer: System allows override but logs it for audit
- "Isn't this paternalistic?" - Answer: No, volunteer can always refuse tasks; we're just recommending

---

### 1.5 What is an offline-first PWA and why is it important?

**Expected Answer** (1.5 minutes):
**PWA = Progressive Web App** - A web application that works like a native mobile app but runs in the browser. No need to install from app store.

**Offline-first means**: App works 100% offline, then syncs when online.

**How it works**:
1. **Service Worker** (runs in background) caches essential files (HTML, CSS, JS, images)
2. **IndexedDB** (browser database) stores volunteer data, tasks, logs locally
3. **Sync Queue** (data structure) tracks pending actions (task completions, location updates)
4. **When offline**: Volunteer sees cached data, can take actions, all stored locally
5. **When online**: Sync queue processes pending actions, sends to backend, receives updates

**Example Flow**:
```
Offline Scenario:
- Volunteer accepts task → Stored in IndexedDB, queued in sync
- Volunteer marks task complete → Stored locally, hours logged
- Volunteer goes offline on mountain
- 8 hours later, gets signal
- Auto-sync: All pending actions sent to backend
- Backend processes, syncs back
- Volunteer sees "sync complete" notification
```

**Why Important for India**:
- Rural areas = spotty connectivity (0.5G, 2G)
- Disaster areas = destroyed cell towers
- Mountains = no signal for hours/days
- Offline-first means volunteers can keep working no matter what

**Follow-ups**:
- "How does IndexedDB compare to offline?" - Answer: IndexedDB is the database, offline is the architecture
- "What if data conflicts (edited locally + backend)?" - Answer: Last-write-wins, or manual merge
- "Storage limits?" - Answer: IndexedDB typically 50MB-1GB depending on browser

---

### 1.6 Explain the tech stack in one sentence per technology.

**Expected Answer**:
- **Backend**: Express.js (lightweight Node.js framework) + TypeScript (type-safe JavaScript)
- **Frontend**: React (component library) + Vite (fast build tool)
- **Database**: PostgreSQL (relational, powerful) + Prisma (ORM for type-safe queries)
- **Real-time**: WebSocket via Socket.io (two-way communication)
- **Authentication**: JWT tokens (stateless, scalable)
- **Deployment**: Render (backend) + Vercel (frontend)
- **Testing**: Jest (unit tests) + React Testing Library (component tests)

**Why These Choices**:
- Proven, production-ready technologies
- Large communities for support
- TypeScript = fewer bugs
- PostgreSQL = complex queries for geospatial data
- Vercel = global CDN for frontends
- Render = simple deployments with auto-scaling

**Why not** (common questions):
- Why not React Native (mobile app)? - Answer: PWA reaches more users, no app store friction, offline works better
- Why not NoSQL? - Answer: Relational data (disasters → tasks → volunteers) fits SQL better
- Why not Docker everywhere? - Answer: Render + Vercel handle containers; simpler for us

---

## SECTION 2: ARCHITECTURE & DESIGN (Intermediate)

These questions go deeper into system design decisions.

### 2.1 Draw the architecture on paper (if asked).

**Expected Answer** (and what you draw):
```
┌─────────────────────────────────────────────────────┐
│              CLIENT LAYER (Frontends)                │
├─────────────────────────────────────────────────────┤
│  IVR (Voice)  │  PWA (Offline)  │  Dashboard (Web)  │
│  Exotel       │  React + Vite   │  React + Vite     │
│  Port: Voice  │  Port: 5173     │  Port: 5174       │
└────────┬───────────────┬────────────────┬───────────┘
         │               │                │
         └───────────────┼────────────────┘
                         │ HTTPS
         ┌───────────────┴───────────────┐
         │   Express.js + TypeScript     │
         │   Backend API (46 endpoints)  │
         │   Port: 3000                  │
         └───────────────┬───────────────┘
                         │ Prisma ORM
         ┌───────────────┴───────────────┐
         │     PostgreSQL Database       │
         │     - 8 Models               │
         │     - Geospatial Indexes     │
         │     - Encrypted Data         │
         └───────────────────────────────┘
         
Optional:
- Redis Cache (future scaling)
- S3 (file storage, future)
```

**Key Points to Mention**:
- All frontends talk to single backend API
- Backend handles business logic + RBAC
- Database is source of truth
- WebSocket for real-time (bidirectional)
- Stateless (each request independent)

---

### 2.2 How is the database structured? Explain the 8 models.

**Expected Answer** (diagram + explanation):

**8 Models**:
1. **User** (Coordinators, Admins)
   - Fields: id, email, passwordHash, name, role (VOLUNTEER, NGO_COORDINATOR, DISASTER_ADMIN, SUPER_ADMIN)
   - Purpose: Admin dashboard access control
   - ~5-10 per system

2. **Volunteer** (Phone-based volunteers)
   - Fields: id, phoneEncrypted, phoneHash, name, skills[], availability, burnoutScore, location (lat/lng), lastActiveAt, totalTasksCompleted
   - Purpose: Manage volunteers, track availability
   - ~50-10000 per disaster
   
3. **Disaster** (Earthquake, flood, etc.)
   - Fields: id, name, type, location, coordinates (lat/lng), status (ACTIVE, RESOLVED, ARCHIVED), startDate, endDate
   - Purpose: Contain tasks, group response efforts
   - ~1-5 per response

4. **Task** (Work assignments)
   - Fields: id, title, description, disasterId (FK), requiredSkills[], location (lat/lng), urgency, status (OPEN, IN_PROGRESS, COMPLETED), assignedVolunteerId (FK), estimatedHours, maxVolunteers, createdAt, assignedAt, completedAt
   - Purpose: Work units, assign to volunteers
   - ~100-100000 across disasters

5. **TaskLog** (Audit trail)
   - Fields: id, taskId (FK), volunteerId (FK), action (string), hoursLogged, createdAt
   - Purpose: Track who did what, when
   - ~2 per task on average

6. **WellnessCheckin** (Health tracking)
   - Fields: id, volunteerId (FK), checkinDate, feeling (enum), sentimentScore
   - Purpose: Burnout detection, wellbeing monitoring
   - ~1 per volunteer per day

7. **IVRLog** (Phone integration)
   - Fields: id, volunteerId (FK), callSid, direction (INBOUND/OUTBOUND), actionType (get_tasks, log_hours, etc.), language, createdAt
   - Purpose: Track IVR interactions, debug phone issues
   - ~2 per volunteer per day

8. **VolunteerLog** (Optional, not always created)
   - Similar to IVRLog but for app interactions
   - Helps with analytics

**Relationships**:
```
User (1) ──→ (many) Task (creates)
Volunteer (1) ──→ (many) Task (assigned)
Disaster (1) ──→ (many) Task
Task (1) ──→ (many) TaskLog
Volunteer (1) ──→ (many) WellnessCheckin
Volunteer (1) ──→ (many) IVRLog
```

---

### 2.3 What security measures are in place?

**Expected Answer** (organized):

**Encryption**:
- Phone numbers: AES-256-GCM at rest (cannot decrypt without key)
- Phone lookup: SHA-256 hash index (searchable, not reversible)
- Passwords: bcrypt 12 rounds
- JWT tokens: Signed with HS256 (cannot be forged)

**Authentication**:
- Email/password for coordinators
- Phone-only for volunteers (OTP optional, not always enabled)
- JWT tokens: 15-min access, 7-day refresh, 30-day volunteer

**Authorization**:
- 4-tier RBAC: Volunteer → Coordinator → Disaster Admin → Super Admin
- Row-level security: Volunteer can only see own tasks
- Endpoint-level: `/api/admin/*` requires SUPER_ADMIN

**Data Protection**:
- No sensitive data in logs
- Phone numbers masked in UI (9123456*****)
- Geolocation: Only coordinates, addresses calculated on-demand
- No third-party data sharing

**API Security**:
- HTTPS only (TLS 1.3)
- CORS: Only frontend domains allowed
- Rate limiting: 100 req/15min per IP (except IVR)
- Input validation: Zod schemas on all endpoints
- SQL injection: Prisma parameterized queries prevent it
- XSS: React auto-escapes, no innerHTML

**Session Security**:
- Tokens stored in localStorage (vulnerable to XSS, but unavoidable for SPA)
- Alternative: HttpOnly cookies better (not implemented, but noted)
- Token refresh: Automatic via refresh token

---

### 2.4 How do you handle geospatial queries?

**Expected Answer** (1.5-2 minutes):

**Geospatial Needs**:
- Find volunteers within X km of a task
- Find tasks within X km of a volunteer
- Cluster volunteers by region
- Heatmap of disaster impact

**Solution Used**:
- PostgreSQL with PostGIS extension (geospatial plugin)
- Haversine formula for distance calculations
- Spatial indexes for O(log n) lookup

**Example Query - Find nearby volunteers**:
```sql
SELECT volunteer.*, 
       ST_Distance(volunteer.location, $1::geometry) AS distance
FROM volunteer
WHERE ST_DWithin(volunteer.location, $1::geometry, 5000) -- 5km radius
ORDER BY distance
LIMIT 10;
```

**In Code (Prisma)**:
```typescript
const nearby = await prisma.$queryRaw`
  SELECT * FROM Volunteer
  WHERE ST_Distance(
    ST_Point(currentLng, currentLat),
    ST_Point(${lng}, ${lat})
  ) < 5000 -- meters
  ORDER BY ST_Distance(...) ASC
`;
```

**Performance**:
- Spatial indexes: < 100ms for 10,000 volunteers
- Without indexes: > 5 seconds (unacceptable)
- Trade-off: Spatial indexes use extra disk space (~10%)

---

### 2.5 How does the real-time system work?

**Expected Answer**:

**Technology**: WebSocket via Socket.io

**Real-time Events**:
1. Task assigned → Volunteer notified instantly
2. Volunteer location updated → Dashboard map updates
3. Task marked complete → All coordinators see status change
4. Volunteer goes offline → Dashboard shows "offline" badge

**Architecture**:
```
Frontend (Browser)
  ↕ WebSocket (Socket.io)
Backend (Express + Socket.io server)
  ↕ In-memory event broadcasting
All connected clients receive update
```

**Example Flow - Assign Task**:
1. Coordinator clicks "Assign" in dashboard
2. Frontend sends POST /api/tasks/:id/assign
3. Backend:
   - Updates database
   - **Emits event**: `socket.emit('task:assigned', { taskId, volunteerId })`
4. All connected PWA apps listening for this volunteer's ID receive notification
5. Volunteer sees notification instantly
6. Volunteer can accept/reject task in real-time

**Challenges**:
- WebSocket disconnects in bad networks → Need fallback to polling
- Scaling to 1000+ concurrent: Redis pub/sub can help
- Battery drain on mobile: Socket.io has heartbeat optimization

---

### 2.6 Explain the disaster-task-volunteer lifecycle.

**Expected Answer** (diagram + flow):

**Timeline**:
```
T=0: Disaster occurs
T=10min: Coordinator creates Disaster record
  - Name: "Earthquake - Shimla"
  - Status: ACTIVE
  - Location: coordinates
  
T=15min: Coordinator creates Tasks
  - Task 1: "Search and Rescue - Building A"
  - Task 2: "Medical Relief Camp"
  - Status: OPEN (waiting for volunteers)
  - No volunteer assigned yet
  
T=20min: System shows AI matches
  - Dashboard shows top 5 volunteers for each task
  - Scores based on skill, distance, burnout
  
T=25min: Task assigned
  - Coordinator clicks "Assign Rajesh Kumar" to Task 1
  - Backend: Task.status = IN_PROGRESS, Task.assignedVolunteerId = rajesh_id
  - Notification sent to Rajesh via PWA/IVR
  
T=26min: Volunteer accepts
  - Rajesh confirms in PWA: "Accept Task"
  - Task.acceptedAt = T=26min
  
T=40min: Volunteer starts work
  - Rajesh clicks "Start Task"
  - Task.startedAt = T=40min
  
T=8h: Volunteer completes
  - Rajesh logs hours worked, notes, people served
  - Task.status = COMPLETED
  - Task.completedAt = T=8h
  - TaskLog created: "Completed, 8 hours, 15 people served"
  
T=9h: Disaster resolved
  - Coordinator marks disaster as RESOLVED
  - No new tasks created
  - Status: RESOLVED
  
T=1 week: Disaster archived
  - Old data moved to archive
  - Still queryable, but not in main lists
  - Status: ARCHIVED
```

---

## SECTION 3: IMPLEMENTATION DETAILS (Advanced)

These questions assume you've read the code.

### 3.1 Walk me through the volunteer login flow.

**Expected Answer** (code-level):

**Step 1: Frontend - Phone Input**
```typescript
// frontend-pwa/src/pages/Login.tsx
const [phone, setPhone] = useState('');
const handleSubmit = async () => {
  const res = await fetch('/api/auth/login-volunteer', {
    method: 'POST',
    body: JSON.stringify({ phone }) // +919123456789
  });
  const { token } = await res.json();
  localStorage.setItem('volunteerToken', token);
  navigate('/tasks');
};
```

**Step 2: Backend - Authenticate**
```typescript
// backend/src/routes/auth.ts
POST /api/auth/login-volunteer
Body: { phone: "+919123456789" }

// backend/src/services/authService.ts
const loginVolunteer = async (phone: string) => {
  // 1. Hash phone for lookup
  const phoneHash = crypto.createHash('sha256').update(phone).digest('hex');
  
  // 2. Find volunteer by hash
  const volunteer = await prisma.volunteer.findUnique({
    where: { phoneHash }
  });
  
  if (!volunteer) {
    throw new Error('Volunteer not found');
  }
  
  // 3. Generate JWT token (30 days for volunteers)
  const token = jwt.sign(
    { volunteerId: volunteer.id, role: 'VOLUNTEER' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  return { token, volunteer };
};
```

**Step 3: Frontend - Store Token**
```typescript
localStorage.setItem('volunteerToken', token);
// All future requests include:
// Authorization: Bearer <token>
```

**Step 4: API Calls - Check Token**
```typescript
// backend/src/middleware/authMiddleware.ts
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.volunteerId = decoded.volunteerId;
    req.role = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

**Key Points**:
- Phone is hashed, never stored plaintext
- JWT token is stateless (no session storage on backend)
- Token expires after 30 days
- Refresh token available if needed

---

### 3.2 How does the matching algorithm code work?

**Expected Answer** (pseudo-code + explanation):

```typescript
// backend/src/services/matchingService.ts

interface MatchScore {
  volunteerId: string;
  score: number; // 0-100
  reasons: string[];
}

const calculateMatchScore = async (
  taskId: string,
  volunteerId: string
): Promise<MatchScore> => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  const volunteer = await prisma.volunteer.findUnique({ where: { id: volunteerId } });
  
  // Component 1: Skill Match (40%)
  const skillOverlap = volunteer.skills.filter(s => 
    task.requiredSkills.includes(s)
  ).length;
  const skillMatch = (skillOverlap / Math.max(task.requiredSkills.length, 1)) * 40;
  
  // Component 2: Distance (30%)
  const distance = haversineDistance(
    volunteer.currentLat, volunteer.currentLng,
    task.latitude, task.longitude
  );
  const maxDistance = 50; // km
  const distanceScore = Math.max(0, (1 - distance / maxDistance) * 30);
  
  // Component 3: Availability/Burnout (20%)
  let availabilityScore = 0;
  if (!volunteer.isAvailable) {
    availabilityScore = 0;
  } else if (volunteer.burnoutScore > 75) {
    availabilityScore = 0; // Exclude critical burnout
  } else {
    // Score inversely proportional to burnout
    availabilityScore = (1 - volunteer.burnoutScore / 100) * 20;
  }
  
  // Component 4: Language (10%)
  const languageMatch = volunteer.language === task.language ? 10 : 5;
  
  // Total
  const totalScore = skillMatch + distanceScore + availabilityScore + languageMatch;
  
  return {
    volunteerId,
    score: Math.round(totalScore),
    reasons: [
      `Skills: ${skillMatch}% (${skillOverlap}/${task.requiredSkills.length})`,
      `Distance: ${distanceScore}% (${distance.toFixed(1)}km)`,
      `Availability: ${availabilityScore}% (burnout: ${volunteer.burnoutScore})`,
      `Language: ${languageMatch}% (${volunteer.language})`
    ]
  };
};

const findBestMatches = async (
  taskId: string,
  limitTo: number = 5
): Promise<MatchScore[]> => {
  const task = await prisma.task.findUnique({
    include: { disaster: true }
  });
  
  // Get all volunteers in disaster region (geospatial filter)
  const volunteers = await prisma.$queryRaw`
    SELECT * FROM Volunteer
    WHERE ST_DWithin(
      ST_Point(currentLng, currentLat),
      ST_Point(${task.longitude}, ${task.latitude}),
      50000 -- 50km radius
    )
  `;
  
  // Score each volunteer
  const scores = await Promise.all(
    volunteers.map(v => calculateMatchScore(taskId, v.id))
  );
  
  // Sort by score descending, filter out 0 scores
  return scores
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limitTo);
};
```

**Time Complexity**:
- Geospatial filter: O(log n) with spatial index
- Scoring: O(m) where m = volunteers within 50km
- Total: O(log n + m) ≈ O(m) for typical m << n

---

### 3.3 How does the offline sync work in the PWA?

**Expected Answer** (architecture):

**Components**:

1. **Service Worker** (runs in background)
```typescript
// frontend-pwa/src/sw.ts
self.addEventListener('install', (event) => {
  // Cache essential files
  event.waitUntil(
    caches.open('v1').then((cache) => {
      cache.addAll([
        '/',
        '/manifest.json',
        '/styles.css',
        '/app.js'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Return cached if offline
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

2. **IndexedDB** (local database)
```typescript
// frontend-pwa/src/lib/db.ts
const db = new Dexie('sevasync');
db.version(1).stores({
  tasks: 'id, status, disasterId',
  volunteers: 'id',
  syncQueue: 'id, status' // Pending actions
});

// Store task locally
await db.tasks.put({ id: 123, title: 'Rescue', status: 'OPEN' });

// Queue for sync
await db.syncQueue.put({
  id: 'sync_1',
  action: 'task:complete',
  taskId: 123,
  hoursLogged: 8,
  status: 'pending',
  createdAt: Date.now()
});
```

3. **Sync Manager**
```typescript
// frontend-pwa/src/services/syncService.ts
class SyncManager {
  async startSync() {
    // Check online
    if (!navigator.onLine) {
      console.log('Offline, skipping sync');
      return;
    }
    
    // Get all pending items
    const pending = await db.syncQueue
      .where('status').equals('pending')
      .toArray();
    
    for (const item of pending) {
      try {
        // Send to backend
        const res = await fetch(`/api/tasks/${item.taskId}/complete`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            hoursLogged: item.hoursLogged,
            notes: item.notes
          })
        });
        
        if (res.ok) {
          // Mark synced
          await db.syncQueue.update(item.id, { status: 'synced' });
          console.log('Synced:', item.id);
        } else {
          console.error('Sync failed:', res.status);
        }
      } catch (err) {
        console.error('Sync error:', err);
        // Will retry on next connection
      }
    }
  }
}

// Listen for online event
window.addEventListener('online', () => syncManager.startSync());

// Also sync periodically
setInterval(() => syncManager.startSync(), 30000); // Every 30 sec
```

**User Flow**:
```
Offline:
1. User completes task → LocalAction ({ action: 'complete', taskId, hours })
2. Action queued in IndexedDB
3. UI shows "Syncing..." → badge on task
4. User continues working

Online:
1. Connection detected → SyncManager.startSync()
2. Reads queue from IndexedDB
3. POST each action to backend
4. Backend processes, stores in database
5. Response: { status: 'success' }
6. LocalAction marked 'synced'
7. UI shows checkmark ✓
```

**Conflict Resolution**:
- Last-write-wins (simple, works for most cases)
- If backend version newer: Discard local, pull backend
- Manual merge available if needed

---

### 3.4 How does encryption/hashing work for phone numbers?

**Expected Answer**:

**Why Both Encryption AND Hashing?**
- Encryption: Decrypt if authorized (use value)
- Hash: One-way, use for lookups (no decryption)

**Code**:
```typescript
// backend/src/utils/crypto.ts

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32-byte hex

export const encryptPhone = (phone: string): string => {
  // Encrypt with AES-256-GCM
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(phone, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  // Return: iv:authTag:encrypted (for decryption later)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

export const decryptPhone = (encrypted: string): string => {
  const [ivHex, authTagHex, encryptedHex] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

export const hashPhone = (phone: string): string => {
  // Hash with SHA-256 (one-way)
  return crypto.createHash('sha256').update(phone).digest('hex');
};
```

**Storage**:
```typescript
// When creating volunteer
const volunteer = await prisma.volunteer.create({
  data: {
    phoneEncrypted: encryptPhone('+919123456789'), // Can decrypt
    phoneHash: hashPhone('+919123456789'),         // Cannot decrypt
    // ... other fields
  }
});
```

**Lookup**:
```typescript
// When logging in
const phone = '+919123456789';
const hash = hashPhone(phone);

const volunteer = await prisma.volunteer.findUnique({
  where: { phoneHash: hash } // Use hash for lookup
});

// If need to display
const decrypted = decryptPhone(volunteer.phoneEncrypted);
```

**Why This Works**:
- Database stores encrypted phones (safe at rest)
- Hash index allows fast lookup without decrypting
- Even if database compromised, encryption key needed to decrypt
- Hash is one-way, even more secure

---

## SECTION 4: TESTING & VALIDATION (Intermediate-Advanced)

### 4.1 What testing strategy do you use?

**Expected Answer**:

**Testing Pyramid** (in order of importance):
1. **Unit Tests** (bottom, broad) - 118 tests
   - Individual functions, services, utilities
   - Example: `calculateMatchScore()`, `validateEmail()`
   - Fast, run in < 1 second
   - Test in isolation with mocks

2. **Integration Tests** (middle) - 68 tests
   - API endpoints + database
   - Example: POST /api/tasks → creates task, triggers match scoring
   - Test cross-module interactions
   - Run against real (test) database

3. **Component Tests** (middle) - 63 tests
   - React components
   - Example: TaskCard component displays title, has edit button
   - Mock API calls, test UI interactions
   - Test accessibility

4. **E2E Tests** (top, narrow) - Manual scenarios
   - Full flow: Login → Create task → Assign → Complete
   - Test in real browser (if automated)
   - Slower, expensive, but catch integration issues

**Example Test** (Unit):
```typescript
// backend/tests/services/matching.test.ts
import { calculateMatchScore } from '../../src/services/matchingService';

describe('calculateMatchScore', () => {
  it('should score 100 for perfect match', async () => {
    const score = await calculateMatchScore(
      { requiredSkills: ['rescue'], latitude: 25, longitude: 85 },
      { skills: ['rescue'], currentLat: 25, currentLng: 85, burnoutScore: 10, language: 'en' }
    );
    expect(score).toBe(100);
  });
  
  it('should score 0 for burned out volunteer', async () => {
    const score = await calculateMatchScore(
      { requiredSkills: ['medical'] },
      { skills: ['medical'], burnoutScore: 80 } // Burnout too high
    );
    expect(score).toBe(0);
  });
});
```

**Example Test** (Integration):
```typescript
// backend/tests/routes/tasks.test.ts
describe('POST /api/tasks', () => {
  it('should create task and trigger matching', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Medical Camp',
        disasterId: earthquake.id,
        requiredSkills: ['medical', 'supplies'],
        latitude: 31.1,
        longitude: 77.1,
        urgency: 'HIGH'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.task.id).toBeDefined();
    
    // Verify database
    const task = await prisma.task.findUnique({ where: { id: res.body.task.id } });
    expect(task.title).toBe('Medical Camp');
  });
});
```

**Coverage**:
- Lines: 92%
- Branches: 88%
- Functions: 95%
- Statements: 91%

---

### 4.2 How would you test the offline sync feature?

**Expected Answer**:

**Strategy**:
```typescript
// frontend-pwa/tests/services/sync.test.ts

describe('Offline Sync', () => {
  let db: Database;
  let syncManager: SyncManager;
  
  beforeEach(async () => {
    db = new Dexie('test');
    syncManager = new SyncManager(db);
    // Mock API
    global.fetch = jest.fn();
  });
  
  it('should queue action when offline', async () => {
    // Set offline
    Object.defineProperty(navigator, 'onLine', { value: false });
    
    // Complete task
    await syncManager.completeTask({
      taskId: '123',
      hoursLogged: 8,
      notes: 'Done'
    });
    
    // Verify queued
    const pending = await db.syncQueue.where('status').equals('pending').toArray();
    expect(pending.length).toBe(1);
    expect(pending[0].taskId).toBe('123');
  });
  
  it('should sync when back online', async () => {
    // Setup: add pending action
    await db.syncQueue.put({
      id: 'sync_1',
      action: 'task:complete',
      taskId: '123',
      hoursLogged: 8,
      status: 'pending'
    });
    
    // Mock successful API response
    global.fetch = jest.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    );
    
    // Go online and sync
    Object.defineProperty(navigator, 'onLine', { value: true });
    await syncManager.startSync();
    
    // Verify API called
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/tasks/123'),
      expect.objectContaining({ method: 'POST' })
    );
    
    // Verify marked synced
    const item = await db.syncQueue.get('sync_1');
    expect(item.status).toBe('synced');
  });
  
  it('should retry failed syncs', async () => {
    // Mock failed API response
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: false, status: 500 }) // Fail
      .mockResolvedValueOnce({ ok: true }); // Retry succeeds
    
    // First sync
    await syncManager.startSync();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    
    // Item still pending
    const item = await db.syncQueue.get('sync_1');
    expect(item.status).toBe('pending');
    
    // Second sync (after delay)
    await new Promise(r => setTimeout(r, 100));
    await syncManager.startSync();
    
    expect(global.fetch).toHaveBeenCalledTimes(2);
    const retried = await db.syncQueue.get('sync_1');
    expect(retried.status).toBe('synced');
  });
});
```

---

## SECTION 5: SECURITY & DEPLOYMENT (Advanced)

### 5.1 What are the main security threats and mitigations?

**Expected Answer** (top 10 OWASP):

| Threat | Impact | Mitigation |
|--------|--------|-----------|
| SQL Injection | Attacker reads/modifies all data | Prisma parameterized queries, Zod validation |
| XSS (Cross-Site Scripting) | Attacker injects malicious JS | React auto-escapes, no innerHTML |
| CSRF (Cross-Site Request Forgery) | Attacker tricks user into action | JWT tokens (not cookies), CORS |
| Weak Authentication | Unauthorized access | JWT + bcrypt, phone hashing |
| Broken RBAC | Lower role accesses admin features | 4-tier role system, endpoint guards |
| Insecure Data Exposure | PII leaked | HTTPS only, phone encryption, rate limiting |
| Weak Cryptography | Encryption breakable | AES-256-GCM, bcrypt-12, JWT HS256 |
| Logging/Monitoring Gap | Attackers go undetected | Audit logs for all critical actions |
| Insufficient Rate Limiting | DoS attacks | 100 req/15min per IP |
| Broken Auth Session | Token hijacking | Short token expiry, refresh tokens |

---

### 5.2 How would you deploy this to production?

**Expected Answer** (step-by-step):

**Architecture Decision**:
- Backend: Render.com (managed Node.js + PostgreSQL)
- Frontend: Vercel.com (static CDN, auto-deploys from Git)
- Reason: Simple setup, free tier available, GitHub integration, auto-scaling

**Deployment Steps**:

1. **Prepare Environment**
   ```bash
   # Create .env.production with actual secrets
   DATABASE_URL=postgres://user:pass@render-db-instance.onrender.com:5432/db
   JWT_SECRET=<32+ char random string>
   ENCRYPTION_KEY=<64-char hex string>
   # ... other vars
   ```

2. **Deploy Backend to Render**
   - Push code to GitHub
   - Connect Render to GitHub repo
   - Select `backend` directory
   - Render auto-builds and deploys
   - Runs migrations on first deploy
   - Seeds demo data

3. **Deploy Frontend to Vercel**
   - Create separate Vercel projects for dashboard and PWA
   - Connect to GitHub
   - Set environment variables:
     ```
     VITE_API_URL=https://your-service.onrender.com
     VITE_SOCKET_URL=https://your-service.onrender.com
     ```
   - Vercel auto-builds and deploys

4. **Post-Deployment**
   - Run migrations: `npm run prisma:migrate deploy`
   - Seed data: `npm run prisma:seed`
   - Test health check: `curl https://backend.onrender.com/health`
   - Test API: `curl https://backend.onrender.com/api/disasters`
   - Test frontend: Visit https://dashboard.vercel.app

5. **Monitoring**
   - Set up error tracking (Sentry)
   - Set up uptime monitoring (UptimeRobot)
   - Set up performance monitoring (New Relic)

---

## SECTION 6: DESIGN & PRODUCT THINKING (Intermediate)

### 6.1 Why did you choose this architecture over alternatives?

**Expected Answer**:

**Alternatives Considered**:

1. **Native Mobile App (React Native / Flutter)**
   - Pro: Offline works well, push notifications native
   - Con: App store friction, need separate iOS/Android code
   - Why not: PWA reaches more people, no installation barrier
   
2. **Monolithic Backend (Single database for all)**
   - Pro: Simpler coordination
   - Con: Scaling issues, harder to separate concerns
   - Why not: We chose modular (but still single API) for clarity

3. **Microservices**
   - Pro: Independent scaling, team autonomy
   - Con: Operational complexity, network latency
   - Why not: Over-engineered for current scale (50-1000 volunteers)

4. **NoSQL (MongoDB)**
   - Pro: Flexible schema
   - Con: Geospatial queries weaker, relational data fits SQL
   - Why not: Our data is highly relational (disasters → tasks → volunteers)

5. **GraphQL instead of REST**
   - Pro: Flexible queries, over-fetching prevention
   - Con: Complexity, caching harder
   - Why not: REST is simpler for coordinators learning API, sufficient for our needs

**Final Choice - Why It Works**:
- PostgreSQL: Geospatial (PostGIS), relational (disasters/tasks/volunteers), proven, scalable
- Express: Lightweight, unopinionated, fast, large ecosystem
- React: Component-based, fast re-rendering, large community
- Vite: Fast builds, ES modules, modern tooling
- Vercel + Render: Managed services reduce ops burden

---

### 6.2 How would you prioritize features if you had 3 more months?

**Expected Answer**:

**Priority Tiers** (based on impact + effort):

**Tier 1: High Impact, Low Effort** (Do First):
1. **Multi-language support** - Hindi, Tamil, Telugu, Bengali
   - Impact: 500M+ new users
   - Effort: 1 week (localization library + translate strings)
   - Revenue: Unlock new regions

2. **Mobile push notifications** - Currently web-only
   - Impact: 50% higher task acceptance
   - Effort: 1 week (Firebase Cloud Messaging)
   - Revenue: Better engagement

3. **Burnout prediction model** - ML on historical data
   - Impact: Prevent 30% of dropouts
   - Effort: 2 weeks (train model, integrate)
   - Revenue: Better retention

**Tier 2: Medium Impact, Medium Effort** (Do Second):
1. **Government integration** - NDMA official API
   - Impact: Government contracts
   - Effort: 3-4 weeks (API design, compliance)
   - Revenue: Gov funds

2. **Supply chain optimization** - Route planning for deliveries
   - Impact: 40% faster supply distribution
   - Effort: 3 weeks (routing algorithm)
   - Revenue: New features

3. **Volunteer app (native iOS/Android)**
   - Impact: Better UX, 60% task completion
   - Effort: 6-8 weeks (React Native development)
   - Revenue: Premium tier

**Tier 3: Nice-to-Have, High Effort** (Later):
1. Satellite imagery for damage assessment
2. Blockchain for immutable audit logs
3. Machine learning for skill prediction
4. Advanced analytics dashboard

---

## SECTION 7: LESSONS LEARNED & REFLECTION (Open-Ended)

### 7.1 What would you do differently if starting over?

**Expected Answer** (be honest, thoughtful):

**What Went Well**:
1. Architecture decisions (PostgreSQL, Express, React) solid
2. Test-driven approach prevented many bugs (249 tests)
3. Geospatial focus differentiated product
4. Early focus on offline-first (PWA) justified

**What I'd Change**:
1. **Earlier user testing** - Would have validated IVR with real feature phone users month earlier
2. **Database schema** - Would have planned for analytics tables from start (added later)
3. **Auth design** - Would have used HttpOnly cookies instead of localStorage for better security
4. **API versioning** - Would have versioned API from day 1 (v1/, v2/)
5. **Performance testing** - Would have load tested geospatial queries at 10K+ volunteers earlier

**Why These Matter**:
- User testing: Built wrong features first, had to pivot
- Schema: Added `AnalyticsEvent` table months later, disrupted other work
- Auth: localStorage vulnerable to XSS (though mitigated with React's escaping)
- Versioning: Backward compatibility matters for third-party integrations
- Load testing: Found N+1 query issues in production, could have caught earlier

---

## COMMON FOLLOW-UP QUESTIONS

**Q: Why 50 volunteers in seed data and not 100?**
A: Balanced testing needs (realistic scale) with developer convenience. 50 is enough to test geospatial queries, matching algorithm, burnout distribution. 100+ volunteers would slow down local testing.

**Q: What's your test coverage percentage?**
A: 92% overall (lines), 88% branches. Focused on critical paths (auth, matching, sync). 100% coverage not realistic or valuable - some edge cases don't matter.

**Q: How do you handle phone number privacy in reports?**
A: Phone numbers masked in all UIs (9123456*****). Raw access only for superadmin. Encrypted in database. Audit logs track who accessed PII.

**Q: What if a volunteer's phone number changes?**
A: Not currently supported (would need re-verification). Could add: volunteer sets new phone → OTP verification → old phone marked inactive → update phoneHash. Designed but not implemented.

**Q: How does the system scale to 10K volunteers?**
A: Database indexing (geospatial indexes), query optimization (limit result sets), caching (Redis). Tested with seed data generator. Real load testing needed before 10K launch.

**Q: What about volunteer privacy - can admins see location 24/7?**
A: Yes, by design. Coordinators need location for task assignment. Communicated in terms of use. Volunteer can opt-out of location tracking (become task-only).

**Q: How do you measure if matching algorithm is good?**
A: Three metrics: (1) Task completion rate (high = good matches), (2) Volunteer satisfaction feedback, (3) Comparison to manual coordinator assignments. No ground truth, but these proxies work.

---

## Final Tips for Viva

✅ **DO**:
- Practice answers out loud (not just reading)
- Admit when you don't know, offer to find out
- Connect technical decisions to business impact
- Show you tested everything
- Emphasize user-centricity (volunteers, coordinators)
- Be humble about limitations

❌ **DON'T**:
- Memorize answers word-for-word (sounds robotic)
- Bluff about code you haven't read
- Dismiss questions as "not important"
- Go too deep into irrelevant details
- Claim 100% uptime/security (no system has it)
- Forget to smile and make eye contact

🎯 **Remember**: Examiners want to see:
1. You built something real that solves a problem
2. You understand technical decisions (why, not just what)
3. You tested rigorously
4. You can defend your choices
5. You know the limitations and would improve

Good luck! 🚀
