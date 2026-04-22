# Database Setup Guide

Complete guide to setting up PostgreSQL database for SevaSync with Prisma ORM.

---

## 📋 Prerequisites

- **PostgreSQL 13+** installed locally OR Docker
- **Node.js 18+**
- **Prisma CLI** (installed via npm)

---

## 🚀 Option 1: PostgreSQL with Docker (Recommended)

Fastest way to get started without installing PostgreSQL locally.

### Step 1: Start PostgreSQL Container

```bash
docker run -d \
  --name sevasync-postgres \
  -e POSTGRES_DB=sevasync \
  -e POSTGRES_USER=sevasync_user \
  -e POSTGRES_PASSWORD=dev_password_change_in_prod \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine

# Verify it's running
docker logs sevasync-postgres
```

### Step 2: Verify Connection

```bash
# Install psql client (macOS/Linux)
brew install postgresql

# Or use Docker to connect
docker exec -it sevasync-postgres psql -U sevasync_user -d sevasync
```

Expected output: `sevasync=#` prompt

---

## 🖥️ Option 2: Local PostgreSQL Installation

### macOS

```bash
# Using Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database and user
psql postgres

# In psql prompt:
CREATE DATABASE sevasync;
CREATE USER sevasync_user WITH ENCRYPTED PASSWORD 'dev_password_change_in_prod';
GRANT ALL PRIVILEGES ON DATABASE sevasync TO sevasync_user;
\q
```

### Windows

```bash
# Using Chocolatey
choco install postgresql15

# Or download installer: https://www.postgresql.org/download/windows/

# After installation, open pgAdmin or connect via:
# psql -U postgres

# Create database and user
CREATE DATABASE sevasync;
CREATE USER sevasync_user WITH ENCRYPTED PASSWORD 'dev_password_change_in_prod';
GRANT ALL PRIVILEGES ON DATABASE sevasync TO sevasync_user;
```

### Linux (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql-15

# Start service
sudo systemctl start postgresql

# Create database and user
sudo -u postgres psql

# In psql prompt:
CREATE DATABASE sevasync;
CREATE USER sevasync_user WITH ENCRYPTED PASSWORD 'dev_password_change_in_prod';
GRANT ALL PRIVILEGES ON DATABASE sevasync TO sevasync_user;
\q
```

---

## ⚙️ Prisma Configuration

### Step 1: Environment Setup

```bash
cd backend

# Copy example environment file
cp .env.example .env
```

### Step 2: Configure DATABASE_URL

Edit `backend/.env` and set the correct DATABASE_URL:

**For Docker PostgreSQL:**
```env
DATABASE_URL="postgresql://sevasync_user:dev_password_change_in_prod@localhost:5432/sevasync?schema=public"
```

**For Local PostgreSQL:**
```env
DATABASE_URL="postgresql://sevasync_user:dev_password_change_in_prod@localhost:5432/sevasync?schema=public"
```

**On Windows (named pipe):**
```env
DATABASE_URL="postgresql://sevasync_user:dev_password_change_in_prod@127.0.0.1:5432/sevasync?schema=public"
```

### Step 3: Generate Prisma Client

```bash
cd backend
npm install

# Generate Prisma Client
npm run prisma:generate

# Expected output:
# ✔ Generated Prisma Client to ./node_modules/@prisma/client in 2.34s
```

---

## 🔄 Database Migrations

### Initial Setup

```bash
cd backend

# Run all pending migrations
npm run prisma:migrate

# During first run, Prisma will:
# 1. Create all tables defined in schema.prisma
# 2. Set up indexes and relationships
# 3. Create constraints

# You'll be prompted to create initial migration name (e.g., "init")
```

### What Gets Created

The migrations create these tables:

**User Management**
- `User` - System users (coordinators, admins, volunteers)
- `UserRole` - Role definitions

**Disaster Management**
- `Disaster` - Disaster events
- `DisasterPhase` - Disaster lifecycle phases
- `DisasterMetrics` - Impact tracking

**Volunteer Management**
- `Volunteer` - Volunteer profiles
- `VolunteerSkill` - Skills inventory
- `VolunteerAvailability` - Availability windows

**Task Management**
- `Task` - Relief tasks
- `TaskAssignment` - Task-to-volunteer assignments
- `TaskDependency` - Task relationships

**Communications**
- `Notification` - User notifications
- `IVRCall` - Call log tracking
- `SyncQueue` - Data synchronization queue

**Data**
- `PasswordReset` - Password reset tokens
- `AuditLog` - Activity logging
- And more...

### Check Migration Status

```bash
cd backend

# View pending migrations
npx prisma migrate status

# View applied migrations
npx prisma migrate history
```

---

## 🌱 Seed Demo Data

Populate database with realistic demo data for testing.

### Auto-Seed

```bash
cd backend

# This creates comprehensive demo data:
npm run prisma:seed

# Results in:
# ✓ Created 5 disasters
# ✓ Created 50 volunteers
# ✓ Created 100 tasks
# ✓ Created 50 assignments
# ✓ Seeded 500+ records
```

### What Gets Seeded

**Disasters** (5 total)
- Flood (active)
- Earthquake (planning)
- Cyclone (response)
- Landslide (recovery)
- Fire (concluded)

**Volunteers** (50 total)
- Multiple roles: coordinator, volunteer, admin
- Languages: English, Hindi, Tamil, Marathi
- Skills: medical, search-rescue, logistics, communications, driving
- Geographic distribution across regions
- Availability patterns

**Tasks** (100+ total)
- Rescue operations
- Medical assistance
- Food distribution
- Shelter setup
- Water provision
- And more...

**Test Credentials**
- Admin: `admin@sevasync.local` / `AdminPass@123`
- Coordinator: `coordinator@example.com` / `SecurePass@123`
- Volunteer: `volunteer@example.com` / `VolunteerPass@123`

---

## 🔍 Inspect Database

### Using Prisma Studio

```bash
cd backend

# Open interactive database GUI
npm run prisma:studio

# Browser opens to http://localhost:5555
# View/edit all data in visual interface
```

### Using psql

```bash
# Connect to database
psql postgresql://sevasync_user:dev_password_change_in_prod@localhost:5432/sevasync

# List tables
\dt

# View table structure
\d users

# Simple queries
SELECT COUNT(*) FROM volunteers;
SELECT COUNT(*) FROM disasters;

# Exit
\q
```

### Using pgAdmin (GUI)

Download pgAdmin: https://www.pgadmin.org/download/

**Connect to Database:**
1. Create new server
2. Host: localhost (or docker container IP)
3. Port: 5432
4. Username: sevasync_user
5. Password: dev_password_change_in_prod
6. Database: sevasync

---

## 📊 Database Backups

### Backup Entire Database

```bash
# Using Docker
docker exec sevasync-postgres pg_dump -U sevasync_user sevasync > backup.sql

# Using local psql
pg_dump -U sevasync_user -h localhost sevasync > backup.sql
```

### Restore from Backup

```bash
# Using Docker
docker exec -i sevasync-postgres psql -U sevasync_user sevasync < backup.sql

# Using local psql
psql -U sevasync_user -h localhost sevasync < backup.sql
```

---

## 🔐 Security Settings

### Change Default Password

**IMPORTANT: Change before production deployment**

```bash
# In backend/.env
DATABASE_URL="postgresql://sevasync_user:YOUR_STRONG_PASSWORD@localhost:5432/sevasync"

# Also change in database
psql postgresql://sevasync_user:dev_password@localhost:5432/sevasync

# In psql:
ALTER USER sevasync_user WITH PASSWORD 'new_strong_password';
```

### Production Configuration

```env
# Use environment-specific credentials
DATABASE_URL="postgresql://prod_user:prod_password_64char_min@prod-host:5432/sevasync"

# Enable SSL
DATABASE_URL="postgresql://prod_user:password@prod-host:5432/sevasync?sslmode=require"

# Connection pooling (optional)
DATABASE_URL="postgresql://prod_user:password@prod-host:5432/sevasync?max_poolSize=20"
```

---

## 🆘 Troubleshooting

### "Connection refused" Error

```bash
# Check if PostgreSQL is running
# Docker
docker ps | grep postgres

# macOS
brew services list | grep postgresql

# Linux
systemctl status postgresql

# Start if not running
docker start sevasync-postgres
# or
brew services start postgresql@15
# or
sudo systemctl start postgresql
```

### "Database does not exist" Error

```bash
# Verify database exists
psql postgresql://postgres@localhost:5432/postgres -c "\l"

# Create if missing
psql postgresql://postgres@localhost:5432/postgres -c "CREATE DATABASE sevasync;"
```

### "FATAL: password authentication failed"

Check your DATABASE_URL in `.env`:
```bash
# Verify credentials match
# User: sevasync_user
# Password: dev_password_change_in_prod
# Host: localhost
# Port: 5432
# Database: sevasync
```

### Prisma Migration Conflicts

```bash
# Reset database (WARNING: Deletes all data)
cd backend
npx prisma migrate reset

# This will:
# 1. Drop all tables
# 2. Re-run all migrations
# 3. Re-seed data (if seed script exists)
```

### Port 5432 Already in Use

```bash
# Find process using port 5432
# Windows
netstat -ano | findstr :5432

# macOS/Linux
lsof -i :5432

# Kill process (or change port in docker-compose.yml)
kill -9 <PID>
```

---

## 📈 Performance Optimization

### Enable Query Logging

```env
# In backend/.env
DATABASE_DEBUG=true
```

### Add Indexes

Prisma automatically creates indexes for:
- Primary keys (`@id`)
- Unique fields (`@unique`)
- Foreign keys (`@relation`)

### Connection Pooling

For production, use connection pooling:

```env
DATABASE_URL="postgresql://user:pass@host/db?max_poolSize=20"
```

Or use PgBouncer:
```bash
docker run -d \
  --name pgbouncer \
  -e PGBOUNCER_DATABASES="sevasync=host=postgres port=5432 user=sevasync_user password=dev_password_change_in_prod dbname=sevasync" \
  edoburu/pgbouncer
```

---

## 🔗 Integration with Application

The backend automatically:
1. Generates Prisma Client from schema
2. Uses `DATABASE_URL` to connect
3. Runs migrations on first boot (if needed)
4. Provides type-safe database queries

**No additional setup needed** - Just run:

```bash
cd backend
npm install
npm run dev
```

---

## 📚 Learn More

- **[Prisma Documentation](https://www.prisma.io/docs/)**
- **[PostgreSQL Documentation](https://www.postgresql.org/docs/)**
- **[Docker PostgreSQL Guide](https://hub.docker.com/_/postgres)**

---

**Status**: ✅ Complete  
**Last Updated**: April 22, 2026
