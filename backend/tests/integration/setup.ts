/**
 * Integration Test Setup
 * Provides mocked Prisma client for fast, reliable integration tests
 * No real database needed
 */

// Mock data storage (in-memory)
let mockDatabase: any = {
  users: [],
  volunteers: [],
  disasters: [],
  tasks: [],
  syncQueue: [],
  notifications: [],
  ivrLogs: [],
  taskLogs: [],
  passwordResets: [],
  wellnessCheckins: [],
};

// Mock Prisma Client
export const createMockPrisma = () => {
  return {
    // Users
    user: {
      create: async (data: any) => {
        const id = Math.random().toString(36).substr(2, 9);
        const user = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
        mockDatabase.users.push(user);
        return user;
      },
      findUnique: async (data: any) => {
        if (data.where.email) {
          return mockDatabase.users.find((u: any) => u.email === data.where.email) || null;
        }
        if (data.where.id) {
          return mockDatabase.users.find((u: any) => u.id === data.where.id) || null;
        }
        return null;
      },
      findMany: async () => mockDatabase.users,
      update: async (data: any) => {
        const user = mockDatabase.users.find((u: any) => u.id === data.where.id);
        if (user) {
          Object.assign(user, data.data, { updatedAt: new Date() });
        }
        return user;
      },
      count: async () => mockDatabase.users.length,
    },

    // Volunteers
    volunteer: {
      create: async (data: any) => {
        const id = Math.random().toString(36).substr(2, 9);
        const volunteer = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
        mockDatabase.volunteers.push(volunteer);
        return volunteer;
      },
      findUnique: async (data: any) => {
        return mockDatabase.volunteers.find((v: any) => v.id === data.where.id) || null;
      },
      findMany: async (data?: any) => {
        if (!data) return mockDatabase.volunteers;
        // Mock geospatial filtering
        if (data.where && data.where.latitude) {
          return mockDatabase.volunteers.sort((a: any, b: any) => {
            const distA = Math.hypot(a.latitude - data.where.latitude, a.longitude - data.where.longitude);
            const distB = Math.hypot(b.latitude - data.where.latitude, b.longitude - data.where.longitude);
            return distA - distB;
          });
        }
        return mockDatabase.volunteers;
      },
      update: async (data: any) => {
        const volunteer = mockDatabase.volunteers.find((v: any) => v.id === data.where.id);
        if (volunteer) {
          Object.assign(volunteer, data.data, { updatedAt: new Date() });
        }
        return volunteer;
      },
      count: async (data?: any) => {
        if (data?.where?.status) {
          return mockDatabase.volunteers.filter((v: any) => v.status === data.where.status).length;
        }
        return mockDatabase.volunteers.length;
      },
    },

    // Disasters
    disaster: {
      create: async (data: any) => {
        const id = Math.random().toString(36).substr(2, 9);
        const disaster = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
        mockDatabase.disasters.push(disaster);
        return disaster;
      },
      findUnique: async (data: any) => {
        return mockDatabase.disasters.find((d: any) => d.id === data.where.id) || null;
      },
      findMany: async () => mockDatabase.disasters,
      update: async (data: any) => {
        const disaster = mockDatabase.disasters.find((d: any) => d.id === data.where.id);
        if (disaster) {
          Object.assign(disaster, data.data, { updatedAt: new Date() });
        }
        return disaster;
      },
      count: async (data?: any) => {
        if (data?.where?.status) {
          return mockDatabase.disasters.filter((d: any) => d.status === data.where.status).length;
        }
        return mockDatabase.disasters.length;
      },
    },

    // Tasks
    task: {
      create: async (data: any) => {
        const id = Math.random().toString(36).substr(2, 9);
        const task = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
        mockDatabase.tasks.push(task);
        return task;
      },
      findUnique: async (data: any) => {
        return mockDatabase.tasks.find((t: any) => t.id === data.where.id) || null;
      },
      findMany: async (data?: any) => {
        if (!data) return mockDatabase.tasks;
        if (data.where?.disaster_id) {
          return mockDatabase.tasks.filter((t: any) => t.disaster_id === data.where.disaster_id);
        }
        return mockDatabase.tasks;
      },
      update: async (data: any) => {
        const task = mockDatabase.tasks.find((t: any) => t.id === data.where.id);
        if (task) {
          Object.assign(task, data.data, { updatedAt: new Date() });
        }
        return task;
      },
      count: async (data?: any) => {
        if (data?.where?.status) {
          const statuses = Array.isArray(data.where.status.$in) ? data.where.status.$in : [data.where.status];
          return mockDatabase.tasks.filter((t: any) => statuses.includes(t.status)).length;
        }
        return mockDatabase.tasks.length;
      },
    },

    // Sync Queue
    syncQueue: {
      create: async (data: any) => {
        const id = Math.random().toString(36).substr(2, 9);
        const item = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
        mockDatabase.syncQueue.push(item);
        return item;
      },
      findMany: async () => mockDatabase.syncQueue,
      update: async (data: any) => {
        const item = mockDatabase.syncQueue.find((s: any) => s.id === data.where.id);
        if (item) {
          Object.assign(item, data.data, { updatedAt: new Date() });
        }
        return item;
      },
      deleteMany: async () => {
        const count = mockDatabase.syncQueue.length;
        mockDatabase.syncQueue = [];
        return { count };
      },
      count: async () => mockDatabase.syncQueue.length,
    },

    // Notifications
    notification: {
      create: async (data: any) => {
        const id = Math.random().toString(36).substr(2, 9);
        const notification = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
        mockDatabase.notifications.push(notification);
        return notification;
      },
      findMany: async (data?: any) => {
        if (data?.where?.volunteer_id) {
          return mockDatabase.notifications.filter((n: any) => n.volunteer_id === data.where.volunteer_id);
        }
        return mockDatabase.notifications;
      },
      update: async (data: any) => {
        const notification = mockDatabase.notifications.find((n: any) => n.id === data.where.id);
        if (notification) {
          Object.assign(notification, data.data, { updatedAt: new Date() });
        }
        return notification;
      },
    },

    // Password Resets
    passwordReset: {
      create: async (data: any) => {
        const id = Math.random().toString(36).substr(2, 9);
        const reset = { id, ...data, createdAt: new Date(), expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
        mockDatabase.passwordResets.push(reset);
        return reset;
      },
      findUnique: async (data: any) => {
        return mockDatabase.passwordResets.find((r: any) => r.id === data.where.id) || null;
      },
      findMany: async () => mockDatabase.passwordResets,
      update: async (data: any) => {
        const reset = mockDatabase.passwordResets.find((r: any) => r.id === data.where.id);
        if (reset) {
          Object.assign(reset, data.data);
        }
        return reset;
      },
      delete: async (data: any) => {
        const reset = mockDatabase.passwordResets.find((r: any) => r.id === data.where.id);
        mockDatabase.passwordResets = mockDatabase.passwordResets.filter((r: any) => r.id !== data.where.id);
        return reset;
      },
    },

    // Task Logs
    taskLog: {
      create: async (data: any) => {
        const id = Math.random().toString(36).substr(2, 9);
        const log = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
        mockDatabase.taskLogs.push(log);
        return log;
      },
      findMany: async () => mockDatabase.taskLogs,
    },

    // Wellness Checkins
    wellnessCheckin: {
      create: async (data: any) => {
        const id = Math.random().toString(36).substr(2, 9);
        const checkin = { id, ...data, createdAt: new Date() };
        mockDatabase.wellnessCheckins.push(checkin);
        return checkin;
      },
      findMany: async () => mockDatabase.wellnessCheckins,
    },

    // Reset database
    $reset: async () => {
      mockDatabase = {
        users: [],
        volunteers: [],
        disasters: [],
        tasks: [],
        syncQueue: [],
        notifications: [],
        ivrLogs: [],
        taskLogs: [],
        passwordResets: [],
        wellnessCheckins: [],
      };
    },

    // Disconnect
    $disconnect: async () => {
      // No-op for mock
    },
  };
};

export const mockPrisma = createMockPrisma();

/**
 * Test Fixtures - Sample data for tests
 */
export const fixtures = {
  coordinator: {
    email: 'coordinator@test.org',
    password: 'Test123!@#',
    name: 'Test Coordinator',
    role: 'NGO_COORDINATOR',
  },

  volunteer: {
    phone: '+919123456789',
    name: 'Rajesh Kumar',
    email: 'rajesh@test.org',
    skills: ['first-aid', 'rescue'],
    latitude: 17.385044,
    longitude: 78.486671,
    burnout_score: 0.3,
  },

  disaster: {
    title: 'Mumbai Monsoon Floods 2026',
    location: 'Mumbai, Maharashtra',
    latitude: 19.0760,
    longitude: 72.8777,
    disaster_type: 'FLOOD',
    description: 'Severe flooding in Mumbai',
  },

  task: {
    title: 'Deliver medical kits',
    location: 'Mumbai, Maharashtra',
    latitude: 19.0760,
    longitude: 72.8777,
    task_type: 'SUPPLY',
    urgency: 'CRITICAL',
    required_skills: ['first-aid'],
  },
};
