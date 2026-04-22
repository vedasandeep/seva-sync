# SevaSync Guides Index

Central hub for all SevaSync setup, configuration, and operational guides.

---

## 🚀 Getting Started (5-20 minutes)

### I want to run the platform immediately
→ **[QUICK_START.md](./QUICK_START.md)** (5 minutes)
- Docker Compose one-liner
- Quick local development setup
- Common commands reference

### I want to understand the database
→ **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** (15 minutes)
- PostgreSQL installation (Docker or local)
- Prisma migrations
- Seed data loading
- Backup & restore procedures

### I want to use Docker
→ **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** (20 minutes)
- Docker Compose overview
- Container management
- Volume & network setup
- Production deployment

---

## 🎬 Demos & Showcases

### I want to run a demo for stakeholders
→ **[DEMO_WALKTHROUGH.md](./DEMO_WALKTHROUGH.md)** (5-20 minutes)
- 7 complete demo scenarios
- Quick (5 min) to full (20 min) options
- Coordinator, volunteer, mobile demos
- IVR phone system demo
- Offline capability demo

### I want to show real disaster workflow
→ **[DEMO_GUIDE.md](./DEMO_GUIDE.md)** (10 minutes)
- 7-scenario presentation flow
- Setup checklist
- Demo data reference
- FAQ and troubleshooting

---

## 📚 Documentation

### I need to understand all features
→ **[USER_MANUAL.md](./USER_MANUAL.md)** (30 minutes)
- Coordinator guide (create disasters, assign volunteers)
- Volunteer guide (accept tasks, report status)
- Admin guide (user management, system config)
- IVR system guide (phone-based task assignment)
- FAQ and troubleshooting

### I need to run tests
→ **[README_TESTING.md](./README_TESTING.md)** (20 minutes)
- Test framework setup
- Running tests (249 total: 68 integration, 118 unit, 63 component)
- CI/CD integration
- Test coverage goals

### I need to customize demo data
→ **[SEED_GUIDE.md](./SEED_GUIDE.md)** (15 minutes)
- Seed script usage
- Test credentials
- Creating custom scenarios
- Resetting database

---

## 📊 Project Documentation

### I want to understand the architecture
→ **[03_CODEBASE_ANALYSIS.md](./03_CODEBASE_ANALYSIS.md)**
- Frontend structure
- Backend structure
- Database schema overview
- Key components and services

### I want to see the disaster workflow
→ **[05_DEMO_SCENARIO.md](./05_DEMO_SCENARIO.md)**
- Step-by-step disaster lifecycle
- User interactions
- Data flow
- Integration points

### I want authentication details
→ **[02_AUTH_ARCHITECTURE.md](./02_AUTH_ARCHITECTURE.md)**
- JWT-based authentication
- Role-based access control
- Security implementation
- Token management

---

## 🔍 Quick Reference

### Setup by Role

**👨‍💼 Project Manager**
1. Read [QUICK_START.md](./QUICK_START.md) - Understand overall architecture
2. Run [DEMO_WALKTHROUGH.md](./DEMO_WALKTHROUGH.md) - See full capabilities
3. Check [README_TESTING.md](./README_TESTING.md) - Verify quality

**👨‍💻 Developer**
1. Start with [QUICK_START.md](./QUICK_START.md) - Get platform running
2. Review [03_CODEBASE_ANALYSIS.md](./03_CODEBASE_ANALYSIS.md) - Understand structure
3. Check [README_TESTING.md](./README_TESTING.md) - Learn test patterns

**🐳 DevOps/Infrastructure**
1. Read [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Container setup
2. Review [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database configuration
3. Configure CI/CD from [README_TESTING.md](./README_TESTING.md)

**👥 Support/Training**
1. Study [USER_MANUAL.md](./USER_MANUAL.md) - All user features
2. Review [DEMO_WALKTHROUGH.md](./DEMO_WALKTHROUGH.md) - Demo scenarios
3. Check FAQ in [DEMO_GUIDE.md](./DEMO_GUIDE.md)

---

## ⏱️ Time Estimates

| Task | Guide | Time |
|------|-------|------|
| Get platform running | QUICK_START.md | 5 min |
| Set up database | DATABASE_SETUP.md | 15 min |
| Learn Docker | DOCKER_GUIDE.md | 20 min |
| Quick demo | DEMO_WALKTHROUGH.md | 5 min |
| Full end-to-end demo | DEMO_WALKTHROUGH.md | 20 min |
| Run all tests | README_TESTING.md | 3 min |
| Train new user | USER_MANUAL.md | 30 min |
| Customize demo data | SEED_GUIDE.md | 15 min |
| Full project review | All docs | 2 hours |

---

## 🎯 Common Tasks

### "Get the platform running locally"
```bash
# Read
QUICK_START.md (Local Development Setup section)

# Then run
cd backend && npm install && npm run dev
cd frontend-dashboard && npm install && npm run dev

# Expected: Dashboard at http://localhost:5173
```

### "Run everything with Docker"
```bash
# Read
DOCKER_GUIDE.md

# Then run
docker-compose up --build

# Expected: All services at localhost:5000, 5173, 5174
```

### "See the platform in action"
```bash
# Read
DEMO_WALKTHROUGH.md

# Then run
# Start platform (Docker or local)
# Load seed data: npm run prisma:seed
# Follow Quick Demo scenario (5 min)
```

### "Train a new user"
```bash
# Share with them
USER_MANUAL.md

# Start with sections:
# - Overview (1 min)
# - Coordinator Quick Start or Volunteer Quick Start
# - Their specific role section
```

### "Set up testing"
```bash
# Read
README_TESTING.md

# Then run
cd backend && npm test           # 249 tests
cd frontend-dashboard && npm test  # 63 tests

# Expected: 100% passing
```

### "Deploy to production"
```bash
# Read in order
1. DOCKER_GUIDE.md (Container setup)
2. DATABASE_SETUP.md (Production security section)
3. README_TESTING.md (CI/CD section)

# Then follow containerization steps
```

---

## 📱 Platform URLs

After running `docker-compose up`:

| Component | URL | Purpose |
|-----------|-----|---------|
| **Dashboard** | http://localhost:5173 | Admin interface |
| **PWA** | http://localhost:5174 | Volunteer mobile app |
| **API** | http://localhost:5000 | REST API server |
| **Health** | http://localhost:5000/health | API status |
| **Metrics** | http://localhost:5000/metrics | System metrics |
| **Prisma Studio** | http://localhost:5555 | Database GUI |

---

## 🔐 Test Credentials

Use these to log in after seeding data:

```
Coordinator:
  Email: coordinator@example.com
  Password: SecurePass@123

Volunteer:
  Email: volunteer@example.com
  Password: VolunteerPass@123

Admin:
  Email: admin@sevasync.local
  Password: AdminPass@123
```

---

## 🛠️ Command Cheat Sheet

### Backend
```bash
cd backend

npm run dev                    # Start dev server
npm run build                  # Build for production
npm test                       # Run all tests (249)
npm run test:integration       # Integration tests (68)
npm run test:unit              # Unit tests (118)
npm run prisma:migrate         # Run migrations
npm run prisma:seed            # Load demo data
npm run prisma:studio          # Open database GUI
```

### Frontend Dashboard
```bash
cd frontend-dashboard

npm run dev                    # Start dev server
npm run build                  # Build for production
npm test                       # Run tests (63)
npm run test:ui                # Visual test UI
npm run test:coverage          # Coverage report
```

### Docker
```bash
docker-compose up              # Start all services
docker-compose up -d           # Start in background
docker-compose down            # Stop all services
docker-compose logs -f         # View live logs
docker-compose ps              # List running services
docker-compose exec backend npm test  # Run tests in container
```

---

## 📞 Support & Troubleshooting

### Platform Won't Start
1. Check [QUICK_START.md](./QUICK_START.md) - Troubleshooting section
2. Check [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Troubleshooting section
3. Check logs: `docker-compose logs -f`

### Database Issues
1. Read [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Troubleshooting section
2. Check if PostgreSQL is running: `docker-compose ps`
3. Reset: `docker-compose down -v && docker-compose up`

### Demo Not Working
1. See [DEMO_WALKTHROUGH.md](./DEMO_WALKTHROUGH.md) - Troubleshooting section
2. Verify seed data: `npm run prisma:seed`
3. Check all services running: `docker-compose ps`

### Tests Failing
1. Read [README_TESTING.md](./README_TESTING.md) - Debugging section
2. Run individually: `npm run test:unit`, `npm run test:integration`
3. Check environment: `.env` file exists with correct values

### Forgot Password
1. Reset via [USER_MANUAL.md](./USER_MANUAL.md) - Password reset section
2. Or re-seed data: `npm run prisma:seed`

---

## 📈 Project Status

✅ **Development Status**: Complete  
✅ **Testing**: 249 tests passing (100%)  
✅ **Documentation**: 5 guides + 5 architecture docs  
✅ **Docker**: Fully containerized  
✅ **Ready for**: Demo, deployment, production

---

## 🎓 Learning Path

### Complete Beginner (60 minutes)
1. Read [QUICK_START.md](./QUICK_START.md) (10 min)
2. Run platform with Docker (5 min)
3. Watch [DEMO_WALKTHROUGH.md](./DEMO_WALKTHROUGH.md) (20 min)
4. Explore [USER_MANUAL.md](./USER_MANUAL.md) (15 min)
5. Read project summary in [DAY_9_REPORT.md](../DAY_9_REPORT.md) (10 min)

### Developer (2 hours)
1. Read [QUICK_START.md](./QUICK_START.md) (10 min)
2. Set up local development (15 min)
3. Read [03_CODEBASE_ANALYSIS.md](./03_CODEBASE_ANALYSIS.md) (20 min)
4. Review architecture docs (20 min)
5. Run tests and debug (20 min)
6. Review [README_TESTING.md](./README_TESTING.md) (15 min)

### Presenter/Trainer (90 minutes)
1. Read [QUICK_START.md](./QUICK_START.md) (10 min)
2. Study [DEMO_WALKTHROUGH.md](./DEMO_WALKTHROUGH.md) (30 min)
3. Run full demo end-to-end (20 min)
4. Review [USER_MANUAL.md](./USER_MANUAL.md) for Q&A (20 min)
5. Prepare talking points (10 min)

---

## 📚 File Organization

```
docs/
├── GUIDES_INDEX.md                    # 👈 You are here
├── DAY_9_REPORT.md                    # Project completion summary
│
├── guides/                            # Operational guides
│   ├── QUICK_START.md                 # Get running in 5 minutes
│   ├── DATABASE_SETUP.md              # PostgreSQL & Prisma setup
│   ├── DOCKER_GUIDE.md                # Container orchestration
│   ├── DEMO_WALKTHROUGH.md            # 7 demo scenarios
│   ├── USER_MANUAL.md                 # Feature documentation
│   ├── README_TESTING.md              # Test framework & CI/CD
│   ├── SEED_GUIDE.md                  # Demo data customization
│   ├── DEMO_GUIDE.md                  # Legacy demo guide
│   │
│   └── [Architecture Docs]
│       ├── 01_EXPLORATION_SUMMARY.md
│       ├── 02_AUTH_ARCHITECTURE.md
│       ├── 03_CODEBASE_ANALYSIS.md
│       ├── 04_DEMO_CHECKLIST.md
│       ├── 05_DEMO_SCENARIO.md
│       ├── 06_FRONTEND_MAP_ANALYSIS.md
│       ├── 07_GEO_INFRASTRUCTURE_ANALYSIS.md
│       └── 08_MAPS_IMPLEMENTATION.md
│
├── archive/                           # Historical docs
│   ├── [Previous day reports]
│   └── [Archived guides]
│
└── reports/                           # Historical reports
    └── [Daily status reports]
```

---

## 🎯 Next Steps

**Choose your path:**

- **Running the platform?** → [QUICK_START.md](./QUICK_START.md)
- **Showing a demo?** → [DEMO_WALKTHROUGH.md](./DEMO_WALKTHROUGH.md)
- **Setting up database?** → [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **Learning to use it?** → [USER_MANUAL.md](./USER_MANUAL.md)
- **Understanding code?** → [03_CODEBASE_ANALYSIS.md](./03_CODEBASE_ANALYSIS.md)
- **Deploying to production?** → [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)

---

## 📞 Questions?

Each guide has its own **Troubleshooting** section.

Common issues:
- **Port already in use** → [QUICK_START.md](./QUICK_START.md#troubleshooting)
- **Database connection error** → [DATABASE_SETUP.md](./DATABASE_SETUP.md#troubleshooting)
- **Docker issues** → [DOCKER_GUIDE.md](./DOCKER_GUIDE.md#troubleshooting)
- **Demo not working** → [DEMO_WALKTHROUGH.md](./DEMO_WALKTHROUGH.md#troubleshooting)

---

**Created**: April 22, 2026  
**Status**: ✅ Complete and up-to-date  
**Platform Version**: 1.0.0  
**All Guides Tested**: ✅ Yes

Start with [QUICK_START.md](./QUICK_START.md) →
