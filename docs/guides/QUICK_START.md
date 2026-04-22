# SevaSync - Quick Start Guide

Get the entire SevaSync disaster volunteer coordination platform up and running in minutes.

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** v18+ ([Download](https://nodejs.org))
- **Docker & Docker Compose** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com))
- **PostgreSQL** (optional - Docker provides this)

---

## 🚀 Fastest Start: Docker Compose (Recommended)

This runs the entire stack (PostgreSQL, Backend, Dashboard, PWA) in one command.

### 1. Start Everything

```bash
# Clone the repository
git clone https://github.com/yourusername/sevasync.git
cd sevasync

# Start all services
docker-compose up --build
```

### 2. Wait for Services to Start

```
✅ PostgreSQL ready on port 5432
✅ Backend API ready on http://localhost:5000
✅ Dashboard ready on http://localhost:5173
✅ PWA ready on http://localhost:5174
```

### 3. Access the Platform

- **Dashboard**: http://localhost:5173
- **PWA**: http://localhost:5174
- **API Documentation**: http://localhost:5000/api/docs
- **Health Check**: http://localhost:5000/health
- **Metrics**: http://localhost:5000/metrics

---

## 🛠️ Local Development Setup

Run services locally without Docker for faster development.

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend-dashboard
npm install

# Install PWA dependencies
cd ../frontend-pwa
npm install
```

### Step 2: Setup Database

```bash
cd backend

# Copy environment file
cp .env.example .env

# Start PostgreSQL (requires local installation OR use Docker)
# Option A: Using Docker
docker run -d \
  --name sevasync-postgres \
  -e POSTGRES_DB=sevasync \
  -e POSTGRES_USER=sevasync_user \
  -e POSTGRES_PASSWORD=dev_password_change_in_prod \
  -p 5432:5432 \
  postgres:15-alpine

# Option B: Using local PostgreSQL (update DATABASE_URL in .env)

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed demo data (OPTIONAL)
npm run prisma:seed
```

### Step 3: Start Backend

```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

### Step 4: Start Frontend Dashboard

```bash
cd frontend-dashboard
npm run dev
# Dashboard runs on http://localhost:5173
```

### Step 5: Start PWA (Optional)

```bash
cd frontend-pwa
npm run dev
# PWA runs on http://localhost:5174
```

---

## 🗄️ Database Setup Details

See **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** for:
- PostgreSQL installation
- Initial migration
- Seed data loading
- Database troubleshooting

---

## 🐳 Docker Setup Details

See **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** for:
- Building individual services
- Docker environment variables
- Volume management
- Container logs and debugging

---

## 🎬 Running Demos

See **[DEMO_WALKTHROUGH.md](./DEMO_WALKTHROUGH.md)** for complete demo scenarios:

### Quick Demo (5 minutes)
1. Login as coordinator
2. Create a flood disaster
3. Assign volunteers
4. View live status dashboard

### Full Demo (15 minutes)
- Complete disaster workflow
- Volunteer matching
- Task assignment
- IVR notifications
- Impact reporting
- Data export

---

## 📁 Project Structure

```
sevasync/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── server.ts          # Main server file
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   └── middleware/        # Auth, validation, etc.
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Seed script
│   ├── tests/
│   │   ├── integration/       # Integration tests (68 tests)
│   │   └── unit/              # Unit tests (118 tests)
│   ├── package.json
│   └── .env                   # Environment variables
│
├── frontend-dashboard/         # React admin dashboard
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── hooks/             # Custom React hooks
│   │   └── stores/            # Zustand state management
│   ├── tests/                 # Component tests (63 tests)
│   ├── package.json
│   └── vite.config.ts
│
├── frontend-pwa/              # React Progressive Web App
│   ├── src/
│   └── ...similar structure
│
├── docs/
│   ├── guides/                # All guides (this folder)
│   └── DAY_9_REPORT.md       # Complete project summary
│
├── docker-compose.yml         # Multi-container setup
├── Dockerfile.backend         # Backend container
├── Dockerfile.dashboard       # Dashboard container
└── Dockerfile.pwa            # PWA container
```

---

## 🔧 Common Commands

### Backend

```bash
cd backend

# Development
npm run dev                   # Start dev server with hot reload

# Database
npm run prisma:generate      # Generate Prisma Client
npm run prisma:migrate       # Run migrations
npm run prisma:studio        # Open Prisma Studio GUI
npm run prisma:seed         # Load demo data

# Testing
npm run test                # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:coverage      # Coverage report

# Build & Production
npm run build              # Build TypeScript
npm run start              # Run production build
```

### Frontend Dashboard

```bash
cd frontend-dashboard

# Development
npm run dev                # Start dev server

# Testing
npm run test              # Run tests
npm run test:ui           # Run tests with UI
npm run test:coverage     # Coverage report

# Build
npm run build             # Build for production
npm run preview           # Preview production build
```

---

## ⚙️ Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://sevasync_user:dev_password_change_in_prod@localhost:5432/sevasync

# Redis (optional for advanced features)
REDIS_URL=redis://localhost:6379

# JWT Secrets (MUST change in production)
ACCESS_TOKEN_SECRET=your-super-secret-access-token-key-change-this
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-change-this

# Encryption (32-byte hex string)
ENCRYPTION_KEY=0000000000000000000000000000000000000000000000000000000000000000

# Server
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# Twilio/IVR (optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

See **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** for detailed environment setup.

---

## ✅ Verify Installation

### Backend Health Check

```bash
# Check API is running
curl http://localhost:5000/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2026-04-22T12:00:00Z",
#   "uptime": 12.345,
#   "database": "connected",
#   "memory": "85.2%"
# }
```

### View System Metrics

```bash
curl http://localhost:5000/metrics

# Expected response: Detailed system metrics
```

### Access Dashboard

Open http://localhost:5173 in your browser

**Default login credentials** (after seeding):
- Email: `coordinator@example.com`
- Password: `SecurePass@123`

---

## 🧪 Run Tests

```bash
# Backend: All tests (249 total)
cd backend && npm test

# Backend: Integration tests only (68 tests)
npm run test:integration

# Backend: Unit tests only (118 tests)
npm run test:unit

# Frontend: Component tests (63 tests)
cd frontend-dashboard && npm test
```

All tests should pass ✅

---

## 📊 Seeding Demo Data

Populate the database with realistic disaster scenarios:

```bash
cd backend

# Seed demo data
npm run prisma:seed

# This creates:
# - 50+ volunteers with skills and availability
# - 5 disaster scenarios (flood, earthquake, etc.)
# - 100+ relief tasks
# - Task assignments and volunteer matches
# - Impact reports and metrics
```

See **[SEED_GUIDE.md](./SEED_GUIDE.md)** for customization options.

---

## 🎯 Next Steps

1. **See your data**: Login to Dashboard at http://localhost:5173
2. **Run a demo**: See **[DEMO_WALKTHROUGH.md](./DEMO_WALKTHROUGH.md)**
3. **Understand the code**: See **[CODEBASE_ANALYSIS.md](./03_CODEBASE_ANALYSIS.md)**
4. **Run the tests**: Execute `npm test` in backend and frontend
5. **Check metrics**: View `/metrics` endpoint

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000
# Windows: netstat -ano | findstr :5000
# macOS/Linux: lsof -ti:5000 | xargs kill -9

# Change port in .env (Backend)
PORT=5001
```

### Database Connection Error

```bash
# Check DATABASE_URL in backend/.env
# Ensure PostgreSQL is running:
docker ps | grep postgres

# Reset database:
cd backend
npx prisma db push --skip-generate
npm run prisma:seed
```

### Out of Memory

```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run dev
```

### Stuck on "Building..."

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Detailed Guides

- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Complete database configuration
- **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Docker and containerization
- **[DEMO_WALKTHROUGH.md](./DEMO_WALKTHROUGH.md)** - Running demo scenarios
- **[USER_MANUAL.md](./USER_MANUAL.md)** - User feature documentation
- **[README_TESTING.md](./README_TESTING.md)** - Testing framework details
- **[SEED_GUIDE.md](./SEED_GUIDE.md)** - Demo data customization

---

## 📞 Support

For issues or questions:
1. Check the **[DEMO_GUIDE.md](./DEMO_GUIDE.md)** FAQ section
2. Review error messages in logs: `docker logs sevasync-backend`
3. Check **[README_TESTING.md](./README_TESTING.md)** for CI/CD setup

---

**Status**: ✅ Ready to run  
**Last Updated**: April 22, 2026  
**Version**: 1.0.0
