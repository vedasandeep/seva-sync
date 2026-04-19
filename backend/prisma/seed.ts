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

async function main() {
  console.log('Starting database seeding...\n');

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
  // 2. Create Volunteers
  // ============================================
  console.log('Creating volunteers...');

  const volunteer1 = await prisma.volunteer.create({
    data: {
      phoneEncrypted: encryptPhone('+919123456780', ENCRYPTION_KEY),
      phoneHash: hashPhone('+919123456780'),
      name: 'Rajesh Kumar',
      language: 'hi',
      skills: ['First Aid', 'Medical Support', 'Search and Rescue'],
      currentLat: 19.0760,
      currentLng: 72.8777,
      lastActiveAt: new Date(),
      isAvailable: true,
    },
  });
  console.log(`   Created Volunteer: ${volunteer1.name}`);

  const volunteer2 = await prisma.volunteer.create({
    data: {
      phoneEncrypted: encryptPhone('+919123456781', ENCRYPTION_KEY),
      phoneHash: hashPhone('+919123456781'),
      name: 'Priya Sharma',
      language: 'hi',
      skills: ['Food Distribution', 'Logistics', 'Community Outreach'],
      currentLat: 19.0896,
      currentLng: 72.8656,
      lastActiveAt: new Date(),
      isAvailable: true,
    },
  });
  console.log(`   Created Volunteer: ${volunteer2.name}`);

  const volunteer3 = await prisma.volunteer.create({
    data: {
      phoneEncrypted: encryptPhone('+919123456782', ENCRYPTION_KEY),
      phoneHash: hashPhone('+919123456782'),
      name: 'Mohammed Ali',
      language: 'en',
      skills: ['Medical Support', 'Translation', 'Shelter Management'],
      currentLat: 19.1136,
      currentLng: 72.8697,
      lastActiveAt: new Date(),
      isAvailable: true,
    },
  });
  console.log(`   Created Volunteer: ${volunteer3.name}`);

  const volunteer4 = await prisma.volunteer.create({
    data: {
      phoneEncrypted: encryptPhone('+919123456783', ENCRYPTION_KEY),
      phoneHash: hashPhone('+919123456783'),
      name: 'Lakshmi Iyer',
      language: 'ta',
      skills: ['Psychological Support', 'Child Care', 'Community Outreach'],
      currentLat: 13.0827,
      currentLng: 80.2707,
      lastActiveAt: new Date(),
      isAvailable: true,
      burnoutScore: 3,
    },
  });
  console.log(`   Created Volunteer: ${volunteer4.name}\n`);

  // ============================================
  // 3. Create Disasters
  // ============================================
  console.log('Creating disasters...');

  const mumbaiFloods = await prisma.disaster.create({
    data: {
      name: 'Mumbai Monsoon Floods 2026',
      type: DisasterType.FLOOD,
      location: 'Mumbai, Maharashtra',
      latitude: 19.0760,
      longitude: 72.8777,
      status: DisasterStatus.ACTIVE,
      startDate: new Date(),
    },
  });
  console.log(`   Created Disaster: ${mumbaiFloods.name}`);

  const chennaiCyclone = await prisma.disaster.create({
    data: {
      name: 'Cyclone Vardah 2026',
      type: DisasterType.CYCLONE,
      location: 'Chennai, Tamil Nadu',
      latitude: 13.0827,
      longitude: 80.2707,
      status: DisasterStatus.ACTIVE,
      startDate: new Date(),
    },
  });
  console.log(`   Created Disaster: ${chennaiCyclone.name}`);

  const delhiHeatwave = await prisma.disaster.create({
    data: {
      name: 'Delhi-NCR Heatwave 2026',
      type: DisasterType.OTHER,
      location: 'Delhi NCR',
      latitude: 28.7041,
      longitude: 77.1025,
      status: DisasterStatus.PLANNING,
      startDate: new Date(),
    },
  });
  console.log(`   Created Disaster: ${delhiHeatwave.name}\n`);

  // ============================================
  // 4. Create Tasks
  // ============================================
  console.log('Creating tasks...');

  const task1 = await prisma.task.create({
    data: {
      title: 'Medical Relief Camp - Kurla West',
      description: 'Set up and staff medical relief camp for flood victims.',
      disasterId: mumbaiFloods.id,
      requiredSkills: ['First Aid', 'Medical Support'],
      latitude: 19.0688,
      longitude: 72.8794,
      urgency: TaskUrgency.HIGH,
      status: TaskStatus.OPEN,
      estimatedHours: 6,
      maxVolunteers: 3,
      createdBy: ngoCoordinator.id,
    },
  });
  console.log(`   Created Task: ${task1.title}`);

  const task2 = await prisma.task.create({
    data: {
      title: 'Food Distribution - Dadar Relief Center',
      description: 'Distribute food packets and drinking water to displaced families.',
      disasterId: mumbaiFloods.id,
      requiredSkills: ['Food Distribution', 'Logistics'],
      latitude: 19.0176,
      longitude: 72.8562,
      urgency: TaskUrgency.CRITICAL,
      status: TaskStatus.IN_PROGRESS,
      estimatedHours: 4,
      maxVolunteers: 5,
      currentVolunteers: 1,
      createdBy: ngoCoordinator.id,
      assignedVolunteerId: volunteer2.id,
      assignedAt: new Date(),
    },
  });
  console.log(`   Created Task: ${task2.title}`);

  const task3 = await prisma.task.create({
    data: {
      title: 'Evacuation Support - Coastal Areas',
      description: 'Assist in evacuating families from low-lying coastal areas.',
      disasterId: chennaiCyclone.id,
      requiredSkills: ['Search and Rescue', 'Community Outreach'],
      latitude: 13.0475,
      longitude: 80.2824,
      urgency: TaskUrgency.CRITICAL,
      status: TaskStatus.OPEN,
      estimatedHours: 8,
      maxVolunteers: 10,
      createdBy: ngoCoordinator.id,
    },
  });
  console.log(`   Created Task: ${task3.title}`);

  const task4 = await prisma.task.create({
    data: {
      title: 'Temporary Shelter Setup - Marina Beach',
      description: 'Set up temporary shelter for evacuated families.',
      disasterId: chennaiCyclone.id,
      requiredSkills: ['Shelter Management', 'Logistics'],
      latitude: 13.0499,
      longitude: 80.2824,
      urgency: TaskUrgency.HIGH,
      status: TaskStatus.COMPLETED,
      estimatedHours: 5,
      maxVolunteers: 4,
      currentVolunteers: 1,
      createdBy: ngoCoordinator.id,
      assignedVolunteerId: volunteer3.id,
      assignedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      completedAt: new Date(),
    },
  });
  console.log(`   Created Task: ${task4.title}\n`);

  // ============================================
  // 5. Create Task Logs
  // ============================================
  console.log('Creating task logs...');

  await prisma.taskLog.createMany({
    data: [
      {
        taskId: task2.id,
        volunteerId: volunteer2.id,
        action: 'Task assigned to volunteer',
        hoursLogged: 0,
      },
      {
        taskId: task4.id,
        volunteerId: volunteer3.id,
        action: 'Task assigned to volunteer',
        hoursLogged: 0,
      },
      {
        taskId: task4.id,
        volunteerId: volunteer3.id,
        action: 'Shelter setup completed. 45 families accommodated.',
        hoursLogged: 5,
      },
    ],
  });
  console.log(`   Created 3 task logs\n`);

  // ============================================
  // 6. Create Wellness Check-ins
  // ============================================
  console.log('Creating wellness check-ins...');

  await prisma.wellnessCheckin.createMany({
    data: [
      {
        volunteerId: volunteer1.id,
        checkinDate: new Date(),
        feeling: 'good',
        sentimentScore: 0.8,
      },
      {
        volunteerId: volunteer2.id,
        checkinDate: new Date(),
        feeling: 'tired',
        sentimentScore: 0.4,
      },
      {
        volunteerId: volunteer4.id,
        checkinDate: new Date(),
        feeling: 'stressed',
        sentimentScore: -0.2,
      },
    ],
  });
  console.log(`   Created 3 wellness check-ins\n`);

  // ============================================
  // 7. Create IVR Logs
  // ============================================
  console.log('Creating IVR logs...');

  await prisma.iVRLog.createMany({
    data: [
      {
        volunteerId: volunteer1.id,
        callSid: 'CA1234567890abcdef',
        direction: CallDirection.INBOUND,
        actionType: 'get_tasks',
        language: 'hi',
      },
      {
        volunteerId: volunteer2.id,
        callSid: 'CA2234567890abcdef',
        direction: CallDirection.OUTBOUND,
        actionType: 'log_hours',
        language: 'hi',
      },
      {
        volunteerId: volunteer3.id,
        callSid: 'CA3234567890abcdef',
        direction: CallDirection.INBOUND,
        actionType: 'wellness_checkin',
        language: 'en',
      },
    ],
  });
  console.log(`   Created 3 IVR logs\n`);

  // ============================================
  // Summary
  // ============================================
  console.log('='.repeat(50));
  console.log('Database seeding completed successfully!\n');
  console.log('Summary:');
  console.log(`   - Users: 3 (1 Super Admin, 1 Disaster Admin, 1 NGO Coordinator)`);
  console.log(`   - Volunteers: 4`);
  console.log(`   - Disasters: 3 (2 Active, 1 Planning)`);
  console.log(`   - Tasks: 4 (2 Open, 1 In Progress, 1 Completed)`);
  console.log(`   - Task Logs: 3`);
  console.log(`   - Wellness Check-ins: 3`);
  console.log(`   - IVR Logs: 3`);
  console.log('='.repeat(50));
  console.log('\nTest Credentials:');
  console.log('   Dashboard (email + password):');
  console.log('     admin@sevasync.org / SevaSync2026!');
  console.log('     disaster.admin@sevasync.org / SevaSync2026!');
  console.log('     coordinator@redcross.org / SevaSync2026!');
  console.log('   PWA (phone only):');
  console.log('     9123456780 (Rajesh Kumar)');
  console.log('     9123456781 (Priya Sharma)');
  console.log('     9123456782 (Mohammed Ali)');
  console.log('     9123456783 (Lakshmi Iyer)\n');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
