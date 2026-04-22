# Docker Guide

Complete guide to running SevaSync using Docker and Docker Compose.

---

## 🐳 What is Docker?

Docker packages your application and all dependencies into containers that run consistently across any machine.

**Benefits:**
- No need to install PostgreSQL, Node.js locally
- Identical environment on development, staging, production
- Easy cleanup (just delete containers)
- Fast startup (seconds instead of minutes)

---

## ✅ Prerequisites

- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Docker Compose** (included with Docker Desktop)
- **Git** to clone the repository

### Verify Installation

```bash
docker --version
# Docker version 24.0.0+

docker-compose --version
# Docker Compose version 2.0.0+
```

---

## 🚀 Quick Start with Docker Compose

Run the entire SevaSync stack with one command.

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/sevasync.git
cd sevasync
```

### Step 2: Start All Services

```bash
docker-compose up --build

# First run will:
# 1. Build all images
# 2. Create containers
# 3. Start PostgreSQL
# 4. Run migrations
# 5. Start Backend API
# 6. Start Dashboard
# 7. Start PWA
```

### Step 3: Watch for "Ready" Messages

```
✓ sevasync-postgres:     listening on port 5432
✓ sevasync-backend:      listening on port 5000
✓ sevasync-dashboard:    listening on port 5173
✓ sevasync-pwa:          listening on port 5174
```

### Step 4: Access Services

| Service | URL | Purpose |
|---------|-----|---------|
| **Dashboard** | http://localhost:5173 | Admin interface |
| **PWA** | http://localhost:5174 | Mobile volunteer app |
| **API** | http://localhost:5000 | REST API server |
| **Health** | http://localhost:5000/health | API status |
| **Metrics** | http://localhost:5000/metrics | System metrics |

---

## 📁 Docker Compose File Structure

The `docker-compose.yml` defines 4 services:

### 1. PostgreSQL Database
```yaml
postgres:
  image: postgres:15-alpine
  ports: 5432:5432
  environment: POSTGRES_DB=sevasync, POSTGRES_USER=sevasync_user
  volumes: postgres_data:/var/lib/postgresql/data
  healthcheck: checks connectivity every 10s
```

### 2. Backend API
```yaml
backend:
  build: Dockerfile.backend
  ports: 5000:5000
  depends_on: postgres (waits for postgres to be healthy)
  volumes: ./backend/src:/app/src (live code reload)
  environment: DATABASE_URL, JWT secrets, encryption keys
```

### 3. Dashboard (Admin Frontend)
```yaml
dashboard:
  build: Dockerfile.dashboard
  ports: 5173:80 (mapped to port 80 in container)
  depends_on: backend
  environment: VITE_API_URL=http://localhost:5000
```

### 4. PWA (Volunteer App)
```yaml
pwa:
  build: Dockerfile.pwa
  ports: 5174:80
  depends_on: backend
  environment: VITE_API_URL=http://localhost:5000
```

---

## 🛠️ Common Docker Commands

### Starting Services

```bash
# Start all services in foreground (see logs)
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Rebuild images before starting (after code changes)
docker-compose up --build

# Start specific service
docker-compose up backend

# Start with no cache (force full rebuild)
docker-compose up --build --no-cache
```

### Stopping Services

```bash
# Stop all containers (data preserved)
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove everything including volumes (DATA LOST!)
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

### Viewing Logs

```bash
# View all logs
docker-compose logs

# View backend logs only
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100

# View logs with timestamps
docker-compose logs -t
```

### Executing Commands

```bash
# Run command in backend container
docker-compose exec backend npm run test

# Run command in postgres container
docker-compose exec postgres psql -U sevasync_user -d sevasync

# Open shell in backend
docker-compose exec backend bash

# Open shell in frontend
docker-compose exec dashboard sh
```

### Inspecting Services

```bash
# List all running containers
docker-compose ps

# View service health status
docker-compose ps

# Check container resource usage
docker stats

# View detailed container info
docker-compose ps -a
```

---

## 🔄 Development Workflow

### Working with Code Changes

**Backend changes are hot-reloaded:**
```bash
# Backend volume mount watches for changes
volumes:
  - ./backend/src:/app/src

# Just save files and changes appear immediately
# No need to restart backend
```

**Frontend changes require rebuild:**
```bash
# If dashboard/PWA changes:
docker-compose up --build dashboard
# or
docker-compose up --build pwa
```

### Database Migrations

```bash
# Run migrations in backend container
docker-compose exec backend npm run prisma:migrate

# Seed demo data
docker-compose exec backend npm run prisma:seed

# Open Prisma Studio
docker-compose exec backend npm run prisma:studio
# Then open http://localhost:5555
```

### Running Tests

```bash
# Run backend tests
docker-compose exec backend npm run test

# Run integration tests only
docker-compose exec backend npm run test:integration

# Run frontend tests
docker-compose exec dashboard npm test

# Watch mode
docker-compose exec backend npm run test:watch
```

---

## 📊 Managing Containers

### View Container Status

```bash
# Check if all services are healthy
docker-compose ps

# Expected output:
# NAME                  STATUS
# sevasync-postgres     Up 2 minutes (healthy)
# sevasync-backend      Up 1 minute (healthy)
# sevasync-dashboard    Up 30 seconds (healthy)
# sevasync-pwa          Up 30 seconds (healthy)
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend

# Restart database
docker-compose restart postgres
```

### Access Container Shells

```bash
# Backend (Node.js)
docker-compose exec backend bash

# Frontend (Node.js)
docker-compose exec dashboard sh

# Database (PostgreSQL)
docker-compose exec postgres psql -U sevasync_user -d sevasync

# Exit shell
exit
```

---

## 🗄️ Database Management

### Connect to PostgreSQL

```bash
# Via Docker
docker-compose exec postgres psql -U sevasync_user -d sevasync

# Common commands:
\dt                    # List tables
SELECT COUNT(*) FROM volunteers;
\d users               # Show table structure
\q                     # Quit
```

### Backup Database

```bash
# Backup to file
docker-compose exec postgres pg_dump -U sevasync_user sevasync > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U sevasync_user sevasync < backup.sql
```

### Reset Database

```bash
# WARNING: DELETES ALL DATA
docker-compose exec backend npx prisma migrate reset

# Or manually
docker-compose down -v  # Remove volumes
docker-compose up       # Recreate from migrations
```

---

## 🔧 Configuration & Environment

### Environment Variables

Edit `docker-compose.yml` or create `.env` file:

```bash
# Copy example
cp backend/.env.example backend/.env

# Edit as needed
DATABASE_URL=postgresql://sevasync_user:your_password@postgres:5432/sevasync
ACCESS_TOKEN_SECRET=your_secret_key_here
REFRESH_TOKEN_SECRET=your_refresh_secret_key
```

**Changes require restart:**
```bash
docker-compose restart backend
```

### Custom Ports

Edit `docker-compose.yml`:

```yaml
# Change backend port from 5000 to 8000
backend:
  ports:
    - "8000:5000"  # Host:Container

# Change dashboard port from 5173 to 3000
dashboard:
  ports:
    - "3000:80"
```

Then restart:
```bash
docker-compose up -d
```

---

## 📁 Volumes & Data Persistence

### Understand Volumes

**Named Volume (postgres_data)**
```yaml
volumes:
  postgres_data:  # Named volume
```

**Bind Mount (development)**
```yaml
volumes:
  - ./backend/src:/app/src  # Code from host synced to container
```

### Backup Named Volumes

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect sevasync_postgres_data

# Backup data
docker run --rm -v sevasync_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore
docker run --rm -v sevasync_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

### Remove Volumes

```bash
# Remove with containers
docker-compose down -v

# Remove specific volume
docker volume rm sevasync_postgres_data
```

---

## 🚨 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Port already in use: Change in docker-compose.yml
# - Database not ready: Check postgres healthcheck
# - Environment variable missing: Check .env file
```

### "Cannot connect to database"

```bash
# Check if postgres is healthy
docker-compose ps

# View postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres

# Reset database
docker-compose down -v
docker-compose up
```

### Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # macOS/Linux

# Kill process
taskkill /PID <PID> /F  # Windows
kill -9 <PID>            # macOS/Linux

# OR change port in docker-compose.yml
```

### Out of Memory

```bash
# Increase Docker memory limit
# Docker Desktop Settings > Resources > Memory

# Or limit container memory
# docker-compose.yml:
services:
  backend:
    mem_limit: 1g  # Limit to 1GB
```

### Code Changes Not Reflecting

```bash
# Backend (should auto-reload via volume mount)
# If not working, restart:
docker-compose restart backend

# Frontend (requires rebuild)
docker-compose up --build dashboard

# Force pull latest images
docker-compose pull
docker-compose up --build
```

---

## 🔒 Security Best Practices

### Change Default Credentials

```yaml
# In docker-compose.yml
postgres:
  environment:
    POSTGRES_PASSWORD: your_strong_password_here  # Change from dev_password
```

### Don't Commit Secrets

```bash
# .env should not be committed
echo ".env" >> .gitignore

# Use .env.example instead
cp .env .env.example
# Remove actual secrets, commit .env.example
```

### Network Isolation

```yaml
# docker-compose.yml creates isolated network
networks:
  sevasync-network:
    driver: bridge

# Services communicate via service names:
# Backend → postgres://postgres:5432 (not localhost)
```

---

## 📈 Performance Optimization

### Build Optimization

```bash
# Skip cache for clean rebuild
docker-compose up --build --no-cache

# Multistage builds in Dockerfiles reduce image size
# See Dockerfile.backend for example
```

### Resource Limits

```yaml
# Limit CPU and memory
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

## 🔗 Integration with CI/CD

### GitHub Actions Example

```yaml
name: Docker Build & Test

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: sevasync_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - run: docker-compose up --build
      - run: docker-compose exec -T backend npm test
```

---

## 📚 Advanced Topics

### Custom Docker Images

Build specific services:

```bash
# Build backend image
docker build -f Dockerfile.backend -t sevasync-backend:latest .

# Build dashboard image
docker build -f Dockerfile.dashboard -t sevasync-dashboard:latest .

# Tag for registry
docker tag sevasync-backend:latest myregistry/sevasync-backend:latest
docker push myregistry/sevasync-backend:latest
```

### Docker Registry

```bash
# Login to Docker Hub
docker login

# Push images
docker push username/sevasync-backend:latest

# Pull in production
docker pull username/sevasync-backend:latest
```

---

## 🆘 Getting Help

```bash
# Check Docker daemon status
docker ps

# View system information
docker info

# Check container logs with timestamps
docker-compose logs -t backend

# Inspect container
docker inspect sevasync-backend
```

---

**Status**: ✅ Complete  
**Last Updated**: April 22, 2026
