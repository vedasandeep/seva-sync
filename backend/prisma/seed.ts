import { PrismaClient, UserRole, DisasterType, DisasterStatus, TaskStatus, TaskUrgency, CallDirection } from '@prisma/client';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

// Utility function to encrypt phone numbers (matches crypto.ts)
function encryptPhone(phone: string, encryptionKey: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(encryptionKey, 'hex'),
    iv
  );
  
  let encrypted = cipher.update(phone, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

// Utility function to hash phone numbers (matches crypto.ts)
function hashPhone(phone: string): string {
  return crypto.createHash('sha256').update(phone).digest('hex');
}

// Helper to generate random phone numbers
function generatePhoneNumber(seed: number): string {
  const baseNumber = 9100000000 + seed;
  return `+91${baseNumber}`;
}

// Helper to generate realistic names
const firstNames = ['Rajesh', 'Priya', 'Mohammed', 'Lakshmi', 'Vikram', 'Anjali', 'Arjun', 'Deepika', 'Ramesh', 'Neha', 'Arun', 'Sunita', 'Nitin', 'Pooja', 'Manoj', 'Ritika', 'Suresh', 'Geeta', 'Rohan', 'Sneha', 'Harish', 'Meera', 'Sanjay', 'Divya', 'Kiran', 'Ananya', 'Praveen', 'Shruti', 'Ashok', 'Bhavna', 'Ravi', 'Kavya', 'Ajay', 'Nisha', 'Sandeep', 'Aparna', 'Dinesh', 'Yuki', 'Jayesh', 'Swati', 'Nikhil', 'Rithika', 'Abhishek', 'Sakshi', 'Varun', 'Aisha', 'Naveen', 'Priya', 'Vishal'];
const lastNames = ['Kumar', 'Sharma', 'Ali', 'Iyer', 'Singh', 'Verma', 'Patel', 'Shah', 'Desai', 'Nair', 'Gupta', 'Pandey', 'Trivedi', 'Kapoor', 'Menon', 'Rao', 'Bhat', 'Malhotra', 'Chopra', 'Saxena'];

function generateVolunteerName(index: number): string {
  return `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length) % lastNames.length]}`;
}

// Skills pool
const skillsPool = ['rescue', 'medical', 'supplies', 'logistics', 'communication', 'cooking', 'driving', 'translation', 'shelter', 'water_management', 'sanitation', 'counseling'];

function getRandomSkills(seed: number, count: number = 3): string[] {
  const selected: string[] = [];
  for (let i = 0; i < count; i++) {
    selected.push(skillsPool[(seed + i) % skillsPool.length]);
  }
  return Array.from(new Set(selected));
}

// Task titles by category
const taskTitles: Record<string, string[]> = {
  'rescue': [
    'Search and Rescue - Building A, Sector 2',
    'Locate and rescue survivors from collapsed structure',
    'Building debris clearance and victim search',
    'Underground search operations',
    'Swift water rescue operations',
    'Vehicle extrication operations',
    'Trench rescue operations',
    'Confined space rescue',
  ],
  'medical': [
    'Medical Relief Camp Setup',
    'First Aid Station Operation',
    'Emergency Medical Assessment',
    'Wound Care and Dressing',
    'Medication Distribution',
    'Health Screening Camp',
    'Disease Surveillance',
    'Mental Health Support',
    'Vaccination Drive',
    'Medical Supplies Procurement',
  ],
  'supplies': [
    'Food Distribution',
    'Water Distribution Network',
    'Clothing and Blanket Distribution',
    'Hygiene Kit Distribution',
    'Emergency Supplies Inventory',
    'Supply Chain Management',
    'Warehouse Organization',
    'Stock Taking and Audit',
  ],
  'logistics': [
    'Transportation of Relief Materials',
    'Fleet Management',
    'Route Planning and Optimization',
    'Goods Receiving and Dispatch',
    'Equipment Maintenance',
    'Inventory Management',
    'Procurement Coordination',
  ],
  'shelter': [
    'Temporary Shelter Setup',
    'Shelter Sanitation',
    'Camp Maintenance',
    'Accommodation Arrangement',
    'Facility Management',
    'Space Allocation',
  ],
  'communication': [
    'Community Information Dissemination',
    'Awareness Camp Organization',
    'Public Address System Operation',
    'Communication Coordination',
    'Message Broadcasting',
    'Rumor Control',
  ],
};

async function main() {
  console.log('Starting enhanced database seeding...\n');

  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  
  // Default password for all seed users
  const DEFAULT_PASSWORD = 'SevaSync2026!';
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  // ============================================
  // 1. Create Users (Coordinators & Admins)
  // ============================================
  console.log('Creating users...');
  
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@sevasync.org',
      passwordHash: hashedPassword,
      name: 'Super Administrator',
      role: UserRole.SUPER_ADMIN,
    },
  });
  console.log(`   Created Super Admin: ${superAdmin.email}`);

  const disasterAdmin = await prisma.user.create({
    data: {
      email: 'disaster.admin@sevasync.org',
      passwordHash: hashedPassword,
      name: 'Disaster Response Coordinator',
      role: UserRole.DISASTER_ADMIN,
    },
  });
  console.log(`   Created Disaster Admin: ${disasterAdmin.email}`);

  const ngoCoordinator = await prisma.user.create({
    data: {
      email: 'coordinator@redcross.org',
      passwordHash: hashedPassword,
      name: 'Red Cross Coordinator',
      role: UserRole.NGO_COORDINATOR,
      organization: 'Indian Red Cross Society',
    },
  });
  console.log(`   Created NGO Coordinator: ${ngoCoordinator.email}\n`);

  // ============================================
  // 2. Create 3 Realistic Disasters
  // ============================================
  console.log('Creating 3 realistic disasters...');

  // Disaster 1: Earthquake in Himachal Pradesh
  const earthquake = await prisma.disaster.create({
    data: {
      name: 'Earthquake - Himachal Pradesh',
      type: DisasterType.EARTHQUAKE,
      location: 'Shimla, Himachal Pradesh',
      latitude: 31.1048,
      longitude: 77.1734,
      status: DisasterStatus.ACTIVE,
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  });
  console.log(`   Created Disaster 1: ${earthquake.name} (${earthquake.status})`);

  // Disaster 2: Flood in Bihar
  const flood = await prisma.disaster.create({
    data: {
      name: 'Flood - Bihar',
      type: DisasterType.FLOOD,
      location: 'Patna, Bihar',
      latitude: 25.5941,
      longitude: 85.1376,
      status: DisasterStatus.ACTIVE,
      startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  });
  console.log(`   Created Disaster 2: ${flood.name} (${flood.status})`);

  // Disaster 3: Wildfire in Himachal
  const wildfire = await prisma.disaster.create({
    data: {
      name: 'Wildfire - Kangra District',
      type: DisasterType.FIRE,
      location: 'Kangra, Himachal Pradesh',
      latitude: 32.2230,
      longitude: 76.2597,
      status: DisasterStatus.ACTIVE,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
  });
  console.log(`   Created Disaster 3: ${wildfire.name} (${wildfire.status})\n`);

  // ============================================
  // 3. Create 50 Realistic Volunteers
  // ============================================
  console.log('Creating 50 realistic volunteers...');

  const volunteers: any[] = [];
  const volunteerStates = ['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'PARTIALLY_ENGAGED', 'FULLY_ENGAGED'];
  const languages = ['hi', 'en', 'te', 'as', 'hi', 'hi', 'en'];
  
  // Disaster regions and their coordinates
  const regions = [
    // Shimla region (earthquake) - 10 volunteers
    { name: 'Shimla, HP', lat: 31.1048, lng: 77.1734, count: 10 },
    // Patna region (flood) - 15 volunteers
    { name: 'Patna, Bihar', lat: 25.5941, lng: 85.1376, count: 15 },
    // Kangra region (wildfire) - 10 volunteers
    { name: 'Kangra, HP', lat: 32.2230, lng: 76.2597, count: 10 },
    // General/unassigned - 15 volunteers
    { name: 'Delhi, Delhi', lat: 28.7041, lng: 77.1025, count: 5 },
    { name: 'Mumbai, Maharashtra', lat: 19.0760, lng: 72.8777, count: 5 },
    { name: 'Bangalore, Karnataka', lat: 12.9716, lng: 77.5946, count: 5 },
  ];

  let volunteerIndex = 0;
  for (const region of regions) {
    for (let i = 0; i < region.count; i++) {
      const volunteerId = volunteerIndex++;
      const state = volunteerStates[volunteerId % volunteerStates.length];
      const phone = generatePhoneNumber(9000 + volunteerId);
      const isOffline = volunteerId % 10 === 0; // 10% offline
      
      // Calculate realistic last activity time
      let lastActiveAt: Date;
      if (isOffline) {
        // 24+ hours ago
        lastActiveAt = new Date(Date.now() - (24 + Math.random() * 48) * 60 * 60 * 1000);
      } else if (volunteerId % 5 === 0) {
        // 2-12 hours ago (moderately active)
        lastActiveAt = new Date(Date.now() - (2 + Math.random() * 10) * 60 * 60 * 1000);
      } else {
        // Last 2 hours (very active)
        lastActiveAt = new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000);
      }

      // Burnout score distribution
      let burnoutScore = 0;
      const burnoutRandom = Math.random();
      if (burnoutRandom < 0.5) {
        burnoutScore = Math.random() * 20; // 0-20 (fresh)
      } else if (burnoutRandom < 0.8) {
        burnoutScore = 40 + Math.random() * 20; // 40-60 (moderate)
      } else {
        burnoutScore = 75 + Math.random() * 25; // 75-100 (approaching burnout)
      }

      const volunteer = await prisma.volunteer.create({
        data: {
          phoneEncrypted: encryptPhone(phone, ENCRYPTION_KEY),
          phoneHash: hashPhone(phone),
          name: generateVolunteerName(volunteerId),
          language: languages[volunteerId % languages.length],
          skills: getRandomSkills(volunteerId, 2 + Math.floor(Math.random() * 3)),
          currentLat: parseFloat((region.lat + (Math.random() - 0.5) * 0.1).toFixed(8)),
          currentLng: parseFloat((region.lng + (Math.random() - 0.5) * 0.1).toFixed(8)),
          isAvailable: state === 'AVAILABLE',
          burnoutScore: parseFloat(burnoutScore.toFixed(2)),
          lastActiveAt,
          totalTasksCompleted: Math.floor(Math.random() * 15),
        },
      });
      volunteers.push(volunteer);
    }
  }
  console.log(`   Created 50 volunteers with varied attributes\n`);

  // ============================================
  // 4. Create 100 Tasks with Proper Distribution
  // ============================================
  console.log('Creating 100 tasks with realistic distribution...');

  const tasks: any[] = [];
  let taskIndex = 0;

  // Task distribution: Earthquake (35), Flood (40), Wildfire (25)
  const taskDistribution = [
    { disaster: earthquake, count: 35, categories: { rescue: 12, medical: 8, supplies: 8, shelter: 4, communication: 3 } },
    { disaster: flood, count: 40, categories: { rescue: 8, medical: 10, supplies: 12, shelter: 6, communication: 4 } },
    { disaster: wildfire, count: 25, categories: { rescue: 10, medical: 5, supplies: 6, shelter: 2, communication: 2 } },
  ];

  // Status distribution: PENDING (60%), IN_PROGRESS (25%), COMPLETED (15%)
  const taskStatuses = [
    ...Array(60).fill(TaskStatus.OPEN),
    ...Array(25).fill(TaskStatus.IN_PROGRESS),
    ...Array(15).fill(TaskStatus.COMPLETED),
  ];

  const urgencies = [TaskUrgency.LOW, TaskUrgency.MEDIUM, TaskUrgency.HIGH, TaskUrgency.CRITICAL];
  const baseCoordinates: Record<string, { lat: number; lng: number }> = {
    earthquake: { lat: 31.1048, lng: 77.1734 },
    flood: { lat: 25.5941, lng: 85.1376 },
    wildfire: { lat: 32.2230, lng: 76.2597 },
  };

  for (const dist of taskDistribution) {
    const disasterKey = dist.disaster.id === earthquake.id ? 'earthquake' : dist.disaster.id === flood.id ? 'flood' : 'wildfire';
    const baseCoord = baseCoordinates[disasterKey];
    
    for (const [category, count] of Object.entries(dist.categories)) {
      for (let i = 0; i < count; i++) {
        const status = taskStatuses[taskIndex % taskStatuses.length];
        const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];
        
        // Select a title from the category
        const categoryTitles = taskTitles[category] || taskTitles['rescue'];
        const title = categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
        
        // Calculate realistic timestamps
        const createdTime = new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000); // Within last 5 days
        let assignedTime = null;
        let completedTime = null;

        if (status === TaskStatus.IN_PROGRESS) {
          assignedTime = new Date(createdTime.getTime() + Math.random() * 12 * 60 * 60 * 1000);
        } else if (status === TaskStatus.COMPLETED) {
          assignedTime = new Date(createdTime.getTime() + Math.random() * 12 * 60 * 60 * 1000);
          completedTime = new Date(assignedTime.getTime() + (2 + Math.random() * 8) * 60 * 60 * 1000);
        }

        // Assign volunteer if not open status
        let assignedVolunteerId = null;
        let currentVolunteersCount = 0;
        if (status !== TaskStatus.OPEN) {
          const assignedVolunteer = volunteers[Math.floor(Math.random() * volunteers.length)];
          assignedVolunteerId = assignedVolunteer.id;
          currentVolunteersCount = 1;
        }

        const task = await prisma.task.create({
          data: {
            title,
            description: `${title} - Support needed for disaster relief operations`,
            disasterId: dist.disaster.id,
            requiredSkills: getRandomSkills(taskIndex, 2 + Math.floor(Math.random() * 2)),
            latitude: parseFloat((baseCoord.lat + (Math.random() - 0.5) * 0.05).toFixed(8)),
            longitude: parseFloat((baseCoord.lng + (Math.random() - 0.5) * 0.05).toFixed(8)),
            urgency,
            status,
            estimatedHours: 2 + Math.floor(Math.random() * 12),
            maxVolunteers: 1 + Math.floor(Math.random() * 5),
            currentVolunteers: currentVolunteersCount,
            assignedVolunteerId,
            assignedAt: assignedTime,
            completedAt: completedTime,
            createdBy: ngoCoordinator.id,
            createdAt: createdTime,
          },
        });
        tasks.push(task);
        taskIndex++;
      }
    }
  }
  console.log(`   Created 100 tasks across 3 disasters with realistic distribution\n`);

  // ============================================
  // 5. Create Task Logs for assignments and completions
  // ============================================
  console.log('Creating task logs for completed and in-progress tasks...');

  const taskLogs: any[] = [];
  for (const task of tasks) {
    if (task.assignedVolunteerId && task.status !== TaskStatus.OPEN) {
      // Log assignment
      taskLogs.push({
        taskId: task.id,
        volunteerId: task.assignedVolunteerId,
        action: 'Task assigned to volunteer',
        hoursLogged: 0,
        createdAt: task.assignedAt,
      });

      // Log completion if task is completed
      if (task.status === TaskStatus.COMPLETED) {
        const estimatedHours = task.estimatedHours || 4;
        const actualHours = parseFloat((estimatedHours * (0.8 + Math.random() * 0.4)).toFixed(2));
        taskLogs.push({
          taskId: task.id,
          volunteerId: task.assignedVolunteerId,
          action: `Task completed successfully. ${Math.floor(Math.random() * 20 + 5)} people served.`,
          hoursLogged: actualHours,
          createdAt: task.completedAt,
        });
      }
    }
  }

  if (taskLogs.length > 0) {
    await prisma.taskLog.createMany({ data: taskLogs });
    console.log(`   Created ${taskLogs.length} task logs\n`);
  }

  // ============================================
  // 6. Create Wellness Check-ins
  // ============================================
  console.log('Creating wellness check-ins...');

  const wellnessCheckins = [];
  for (let i = 0; i < Math.min(30, volunteers.length); i++) {
    const volunteer = volunteers[i];
    const feelings = ['good', 'tired', 'exhausted', 'stressed', 'good', 'fine'];
    const sentiment = [-0.5, -0.2, 0.2, 0.5, 0.8, 0.9];
    const randomIdx = Math.floor(Math.random() * feelings.length);

    wellnessCheckins.push({
      volunteerId: volunteer.id,
      checkinDate: new Date(),
      feeling: feelings[randomIdx],
      sentimentScore: sentiment[randomIdx],
    });
  }

  if (wellnessCheckins.length > 0) {
    await prisma.wellnessCheckin.createMany({ data: wellnessCheckins });
    console.log(`   Created ${wellnessCheckins.length} wellness check-ins\n`);
  }

  // ============================================
  // 7. Create IVR Logs
  // ============================================
  console.log('Creating IVR logs...');

  const ivrLogs = [];
  for (let i = 0; i < Math.min(40, volunteers.length); i++) {
    const volunteer = volunteers[i];
    const actionTypes = ['get_tasks', 'log_hours', 'wellness_checkin', 'report_issue'];
    const directions = [CallDirection.INBOUND, CallDirection.OUTBOUND];

    for (let j = 0; j < 1 + Math.floor(Math.random() * 2); j++) {
      ivrLogs.push({
        volunteerId: volunteer.id,
        callSid: `CA${Date.now()}${i}${j}`,
        direction: directions[Math.floor(Math.random() * directions.length)],
        actionType: actionTypes[Math.floor(Math.random() * actionTypes.length)],
        language: volunteer.language,
        createdAt: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000),
      });
    }
  }

  if (ivrLogs.length > 0) {
    await prisma.iVRLog.createMany({ data: ivrLogs });
    console.log(`   Created ${ivrLogs.length} IVR logs\n`);
  }

  // ============================================
  // Summary
  // ============================================
  console.log('='.repeat(60));
  console.log('Enhanced Database Seeding Completed Successfully!\n');
  console.log('Summary:');
  console.log(`   Users: 3 (1 Super Admin, 1 Disaster Admin, 1 NGO Coordinator)`);
  console.log(`   Volunteers: 50 (distributed across regions with varied skills)`);
  console.log(`   Disasters: 3`);
  console.log(`     - Earthquake (Himachal Pradesh) - ACTIVE`);
  console.log(`     - Flood (Bihar) - ACTIVE`);
  console.log(`     - Wildfire (Kangra) - ACTIVE`);
  console.log(`   Tasks: 100`);
  console.log(`     - Earthquake: 35 tasks`);
  console.log(`     - Flood: 40 tasks`);
  console.log(`     - Wildfire: 25 tasks`);
  console.log(`     - Status: ${60} PENDING, ${25} IN_PROGRESS, ${15} COMPLETED`);
  console.log(`   Task Logs: ${taskLogs.length} (assignments and completions)`);
  console.log(`   Wellness Check-ins: ${wellnessCheckins.length}`);
  console.log(`   IVR Logs: ${ivrLogs.length}`);
  console.log('='.repeat(60));
  console.log('\nVolunteer Distribution:');
  console.log(`   - Shimla region (earthquake): 10 volunteers`);
  console.log(`   - Patna region (flood): 15 volunteers`);
  console.log(`   - Kangra region (wildfire): 10 volunteers`);
  console.log(`   - Other regions: 15 volunteers`);
  console.log('\nVolunteer States:');
  console.log(`   - Available: 30 volunteers`);
  console.log(`   - Partially Engaged: 15 volunteers`);
  console.log(`   - Fully Engaged: 5 volunteers`);
  console.log('\nBurnout Scores:');
  console.log(`   - Fresh (0-20): ~50% of volunteers`);
  console.log(`   - Moderate (40-60): ~30% of volunteers`);
  console.log(`   - High (75-100): ~20% of volunteers`);
  console.log('\nActivity Levels:');
  console.log(`   - Very Active (last 2 hours): ~70% of volunteers`);
  console.log(`   - Moderately Active (2-12 hours ago): ~20% of volunteers`);
  console.log(`   - Offline (24+ hours ago): ~10% of volunteers`);
  console.log('='.repeat(60));
  console.log('\nTest Credentials:');
  console.log('   Dashboard (email + password):');
  console.log('     admin@sevasync.org / SevaSync2026!');
  console.log('     disaster.admin@sevasync.org / SevaSync2026!');
  console.log('     coordinator@redcross.org / SevaSync2026!');
  console.log('   PWA (phone only):');
  console.log('     Any of the 50 volunteer phone numbers created\n');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
