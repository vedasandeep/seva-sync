export interface DashboardSummary {
  activeDasasters: number;
  activeVolunteers: number;
  tasksCompletedToday: number;
  pendingTasks: number;
  burnoutAlerts: number;
  ivrCallsToday: number;
  syncFailures: number;
  avgResponseTime: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
}

export interface DashboardAnalytics {
  taskCompletion: Array<{ date: string; completed: number; pending: number }>;
  volunteerActivity: Array<{ date: string; active: number; inactive: number }>;
  disasterDistribution: Array<{ name: string; value: number }>;
  burnoutRisk: Array<{ level: string; count: number }>;
}

// Mock summary data
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    return {
      activeDasasters: 3,
      activeVolunteers: 142,
      tasksCompletedToday: 87,
      pendingTasks: 29,
      burnoutAlerts: 8,
      ivrCallsToday: 64,
      syncFailures: 3,
      avgResponseTime: '12 min',
    };
  } catch (error) {
    console.error('Error in getDashboardSummary:', error);
    throw error;
  }
};

// Mock activity data
export const getDashboardActivity = async (): Promise<ActivityItem[]> => {
  try {
    const activities: ActivityItem[] = [
      {
        id: 'task-001',
        type: 'TASK_COMPLETED',
        title: 'Task Completed',
        message: 'John marked "Medical Supplies Distribution" as completed',
        timestamp: new Date(Date.now() - 5 * 60000),
      },
      {
        id: 'disaster-001',
        type: 'DISASTER_ACTIVATED',
        title: 'Disaster Activated',
        message: 'New disaster "Cyclone - Tamil Nadu" has been activated',
        timestamp: new Date(Date.now() - 15 * 60000),
      },
      {
        id: 'task-002',
        type: 'TASK_ASSIGNED',
        title: 'Task Assigned',
        message: 'Admin assigned "Rescue Operations" to Priya Singh',
        timestamp: new Date(Date.now() - 30 * 60000),
      },
      {
        id: 'burnout-001',
        type: 'BURNOUT_ALERT',
        title: 'Burnout Alert',
        message: 'Rohan Kumar has reached 92% burnout score',
        timestamp: new Date(Date.now() - 1 * 3600000),
      },
      {
        id: 'ivr-001',
        type: 'IVR_CALL',
        title: 'IVR Call Received',
        message: 'Call received from +919876543210',
        timestamp: new Date(Date.now() - 2 * 3600000),
      },
      {
        id: 'sync-001',
        type: 'SYNC_COMPLETE',
        title: 'Offline Sync Completed',
        message: '7 tasks synced successfully',
        timestamp: new Date(Date.now() - 3 * 3600000),
      },
      {
        id: 'task-003',
        type: 'TASK_COMPLETED',
        title: 'Task Completed',
        message: 'Sarah completed "Water Purification Setup"',
        timestamp: new Date(Date.now() - 4 * 3600000),
      },
      {
        id: 'disaster-002',
        type: 'DISASTER_ACTIVATED',
        title: 'Disaster Activated',
        message: '"Flood - Karnataka" moved to ACTIVE status',
        timestamp: new Date(Date.now() - 6 * 3600000),
      },
      {
        id: 'burnout-002',
        type: 'BURNOUT_ALERT',
        title: 'Burnout Alert',
        message: 'Anita Sharma at 78% burnout score',
        timestamp: new Date(Date.now() - 8 * 3600000),
      },
      {
        id: 'sync-002',
        type: 'SYNC_COMPLETE',
        title: 'Offline Sync Completed',
        message: '3 tasks synced from offline queue',
        timestamp: new Date(Date.now() - 12 * 3600000),
      },
    ];

    return activities;
  } catch (error) {
    console.error('Error in getDashboardActivity:', error);
    throw error;
  }
};

// Mock analytics data
export const getDashboardAnalytics = async (): Promise<DashboardAnalytics> => {
  try {
    const taskCompletion = [
      { date: 'Mon', completed: 12, pending: 38 },
      { date: 'Tue', completed: 18, pending: 32 },
      { date: 'Wed', completed: 25, pending: 25 },
      { date: 'Thu', completed: 31, pending: 19 },
      { date: 'Fri', completed: 40, pending: 10 },
      { date: 'Sat', completed: 36, pending: 14 },
      { date: 'Sun', completed: 28, pending: 22 },
    ];

    const volunteerActivity = [
      { date: 'Mon', active: 125, inactive: 17 },
      { date: 'Tue', active: 138, inactive: 12 },
      { date: 'Wed', active: 145, inactive: 8 },
      { date: 'Thu', active: 142, inactive: 10 },
      { date: 'Fri', active: 135, inactive: 15 },
      { date: 'Sat', active: 128, inactive: 18 },
      { date: 'Sun', active: 118, inactive: 24 },
    ];

    const disasterDistribution = [
      { name: 'Flood', value: 8 },
      { name: 'Cyclone', value: 6 },
      { name: 'Earthquake', value: 4 },
      { name: 'Landslide', value: 3 },
      { name: 'Other', value: 2 },
    ];

    const burnoutRisk = [
      { level: 'Low', count: 78 },
      { level: 'Moderate', count: 38 },
      { level: 'High', count: 20 },
      { level: 'Critical', count: 6 },
    ];

    return {
      taskCompletion,
      volunteerActivity,
      disasterDistribution,
      burnoutRisk,
    };
  } catch (error) {
    console.error('Error in getDashboardAnalytics:', error);
    throw error;
  }
};
