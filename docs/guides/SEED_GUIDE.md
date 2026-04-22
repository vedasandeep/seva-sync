# SevaSync Database Seeding Guide

## Overview

The SevaSync database includes a comprehensive seed script that populates realistic demo data for testing, development, and presentations.

## Features

The seed script creates:

- **Users**: Super admin, NGO coordinators, and disaster admins
- **Volunteers**: 50+ volunteers with realistic skills, languages, and availability
- **Disasters**: Multiple active and completed disasters with various severity levels
- **Tasks**: 100+ relief tasks with geographical locations and requirements
- **Task Assignments**: Volunteer assignments to tasks with completion status
- **Reports**: Status reports and impact reports
- **IVR Histories**: Call logs from volunteer phone interactions
- **Notifications**: System notifications for volunteers and coordinators

## Getting Started

### Prerequisites

1. **Database Server Running**
   ```bash
   # Start PostgreSQL (or your configured database)
   # Database must be accessible at the DATABASE_URL in .env
   ```

2. **Environment Variables**
   ```bash
   # Check backend/.env
   DATABASE_URL=postgresql://user:password@localhost:5432/sevasync_dev
   ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
   ```

### Running the Seed Script

```bash
# Navigate to backend directory
cd backend

# Run the seed script
npm run prisma:seed
```

### Expected Output

```
Starting enhanced database seeding...

Creating users...
✓ Created 1 super admin user
✓ Created 3 NGO coordinator users
✓ Created 2 disaster admin users

Creating volunteers...
✓ Created 50 volunteer records

Creating disasters...
✓ Created 5 disaster events

Creating tasks...
✓ Created 100 relief tasks

Creating task assignments...
✓ Created task assignments

Creating reports...
✓ Created status and impact reports

Creating IVR histories...
✓ Created call logs

✓ Database seeding completed successfully!
```

## Test Credentials

After seeding, the following credentials are available for testing:

### Super Admin
- **Email**: admin@sevasync.org
- **Password**: admin123
- **Permissions**: Full system access

### NGO Coordinators
- **Coordinator 1**
  - Email: coordinator1@ngo.org
  - Password: coordinator123
  - Region: Chennai, Tamil Nadu
  
- **Coordinator 2**
  - Email: coordinator2@ngo.org
  - Password: coordinator123
  - Region: Uttarkashi, Uttarakhand
  
- **Coordinator 3**
  - Email: coordinator3@ngo.org
  - Password: coordinator123
  - Region: Idukki, Kerala

### Disaster Admins
- **Disaster Admin 1**
  - Email: admin1@disaster.org
  - Password: admin123
  
- **Disaster Admin 2**
  - Email: admin2@disaster.org
  - Password: admin123

### Volunteers

Sample volunteer phone numbers for IVR testing:
- `+919600000001` (Volunteer 1)
- `+919600000002` (Volunteer 2)
- `+919600000003` (Volunteer 3)
- ... (50 total volunteers)

## Demo Scenarios

### Scenario 1: Activate a Disaster
1. Log in as Coordinator 1
2. Navigate to "Create Disaster"
3. Fill in disaster details (pre-populated with seed data)
4. Set status to "ACTIVE"
5. The system automatically matches nearby volunteers

### Scenario 2: Assign Tasks
1. Log in as Coordinator 1
2. Go to "Active Disasters"
3. Select "Flood in Chennai"
4. Click "Create Task"
5. System suggests volunteers based on location and skills

### Scenario 3: Volunteer Self-Assignment
1. Log in as a Volunteer
2. View "Available Tasks" on dashboard
3. Accept task based on location and skills
4. Check burnout score and availability before accepting

### Scenario 4: Run Reports
1. Log in as Coordinator
2. Go to "Reports" section
3. Select disaster and report type
4. System generates:
   - Status Report (volunteers, tasks, beneficiaries)
   - Impact Report (burnout metrics, outcomes)
   - Resource Report (supplies distribution)

### Scenario 5: IVR Testing
1. Call volunteer phone number (e.g., +919600000001)
2. IVR system options:
   - Select 1: Check task status
   - Select 2: Update location
   - Select 3: Report completion
   - Select 4: Request help

## Data Structure

### Volunteers (50 total)
- **Skills**: Medical, rescue, logistics, communications, cooking, driving, etc.
- **Languages**: Hindi, English, Tamil, Telugu, Marathi
- **Locations**: Distributed across major Indian cities
- **Availability**: Mix of available and unavailable
- **Burnout**: 0-50 score range

### Disasters (5 total)
- **Flood in Chennai**: HIGH severity, ACTIVE
- **Earthquake Response**: CRITICAL severity, ACTIVE
- **Landslide Recovery**: MEDIUM severity, COMPLETED
- **Cyclone Relief**: HIGH severity, ACTIVE
- **Drought Response**: LOW severity, PENDING

### Tasks (100 total)
- **Medical Assistance**: 20 tasks
- **Shelter Setup**: 25 tasks
- **Food Distribution**: 25 tasks
- **Water Supply**: 20 tasks
- **Sanitation**: 10 tasks

## Customizing Seed Data

### Modify Seed Parameters

Edit `prisma/seed.ts` and adjust:

```typescript
// Number of records to create
const SEED_CONFIG = {
  volunteers: 50,        // Change to create more/fewer volunteers
  disasters: 5,
  tasks_per_disaster: 20,
  coordinators: 5,
  admins: 2,
};
```

### Add Custom Locations

Edit the `LOCATIONS` array in `seed.ts`:

```typescript
const LOCATIONS = [
  {
    name: 'Chennai',
    lat: 13.0827,
    lng: 80.2707,
    radius: 10,
  },
  // Add your locations here
];
```

### Modify Volunteer Skills

Edit the `SKILLS` array:

```typescript
const SKILLS = [
  'medical',
  'rescue',
  'logistics',
  // Add or remove skills
];
```

## Resetting the Database

To completely reset and reseed:

```bash
# Reset the database (destructive!)
npm run prisma:reset

# This will:
# 1. Drop the database
# 2. Create a new database
# 3. Run migrations
# 4. Run the seed script
```

**⚠️ Warning**: This deletes all data. Only use in development!

## Troubleshooting

### "Can't reach database server"
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database credentials

### "Connection timeout"
- Increase connection timeout in .env
- Check firewall rules
- Verify database is accessible

### "Unique constraint violation"
- Database may already be partially seeded
- Run `npm run prisma:reset` first
- Or delete specific tables and reseed

### "Migration pending"
- Run pending migrations first:
  ```bash
  npm run prisma:migrate
  ```

## Performance Notes

- **Seeding Time**: ~2-5 minutes depending on server
- **Data Size**: ~50MB of demo data
- **Volunteers**: 50-100+ volunteers recommended for realistic performance testing

## Production Considerations

⚠️ **DO NOT RUN SEED SCRIPT IN PRODUCTION**

- The seed script is for development/testing only
- It uses predictable passwords (for testing)
- Production must use secure credential management
- Always use environment-specific configurations

## Support

For issues with seeding, check:
1. Database connectivity
2. Migrations are current: `npm run prisma:migrate`
3. Encryption key is valid in .env
4. Sufficient disk space available
