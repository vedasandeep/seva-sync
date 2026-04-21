import {
  DashboardSection,
  DashboardGrid,
  WidgetCard,
  SkeletonCard,
  EmptyState,
} from '../components/dashboard';
import {
  KPICards,
  DisasterOverview,
  BurnoutAlertPanel,
  ActivityFeed,
  TaskCompletionChart,
  VolunteerActivityChart,
  DisasterDistributionChart,
  BurnoutRiskChart,
  VolunteerDistributionWidget,
  SyncSummaryPanel,
} from '../features/dashboard/components';
import {
  useDashboardSummary,
  useDashboardActivity,
  useDashboardAnalytics,
} from '../features/dashboard/hooks';

// Mock data fallbacks
const mockSummary = {
  activeDasasters: 3,
  activeVolunteers: 142,
  tasksCompletedToday: 87,
  pendingTasks: 29,
  burnoutAlerts: 8,
  ivrCallsToday: 64,
  syncFailures: 3,
  avgResponseTime: '12 min',
};

const mockSyncData = {
  totalVolunteers: 142,
  volunteersOnline: 128,
  volunteersOffline: 14,
  pendingSyncs: 23,
  syncedToday: 156,
  conflictsPending: 2,
  lastSyncTime: '2 minutes ago',
  syncHealthStatus: 'warning' as const,
};

const mockActivity = [
  {
    id: 'task-001',
    type: 'task_completed',
    message: 'Medical Supplies Distribution marked as completed',
    timestamp: new Date(Date.now() - 5 * 60000),
    actor: 'John Doe',
  },
  {
    id: 'disaster-001',
    type: 'alert',
    message: 'New disaster: Cyclone - Tamil Nadu',
    timestamp: new Date(Date.now() - 15 * 60000),
    actor: 'System',
  },
  {
    id: 'task-002',
    type: 'status_update',
    message: 'Rescue Operations assigned to Priya Singh',
    timestamp: new Date(Date.now() - 30 * 60000),
    actor: 'Admin',
  },
  {
    id: 'burnout-001',
    type: 'alert',
    message: 'Rohan Kumar at 92% burnout risk',
    timestamp: new Date(Date.now() - 1 * 3600000),
    actor: 'System',
  },
  {
    id: 'ivr-001',
    type: 'ivr_call',
    message: 'IVR call received from +919876543210',
    timestamp: new Date(Date.now() - 2 * 3600000),
    actor: 'System',
  },
  {
    id: 'sync-001',
    type: 'message',
    message: '7 tasks synced successfully from offline queue',
    timestamp: new Date(Date.now() - 3 * 3600000),
    actor: 'System',
  },
  {
    id: 'task-003',
    type: 'task_completed',
    message: 'Water Purification Setup completed',
    timestamp: new Date(Date.now() - 4 * 3600000),
    actor: 'Sarah',
  },
  {
    id: 'disaster-002',
    type: 'status_update',
    message: 'Flood - Karnataka moved to ACTIVE status',
    timestamp: new Date(Date.now() - 6 * 3600000),
    actor: 'System',
  },
  {
    id: 'burnout-002',
    type: 'alert',
    message: 'Anita Sharma at 78% burnout risk',
    timestamp: new Date(Date.now() - 8 * 3600000),
    actor: 'System',
  },
  {
    id: 'sync-002',
    type: 'message',
    message: '3 tasks synced from offline queue',
    timestamp: new Date(Date.now() - 12 * 3600000),
    actor: 'System',
  },
];

const mockDisasters = [
  {
    id: '1',
    name: 'Cyclone - Tamil Nadu',
    type: 'Cyclone',
    status: 'ACTIVE' as const,
    location: 'Tamil Nadu',
    activeVolunteers: 45,
    totalVolunteers: 50,
    tasksCompleted: 28,
    totalTasks: 35,
  },
  {
    id: '2',
    name: 'Flood - Karnataka',
    type: 'Flood',
    status: 'ACTIVE' as const,
    location: 'Karnataka',
    activeVolunteers: 62,
    totalVolunteers: 75,
    tasksCompleted: 42,
    totalTasks: 60,
  },
  {
    id: '3',
    name: 'Earthquake - Himachal',
    type: 'Earthquake',
    status: 'MONITORING' as const,
    location: 'Himachal Pradesh',
    activeVolunteers: 35,
    totalVolunteers: 40,
    tasksCompleted: 17,
    totalTasks: 25,
  },
  {
    id: '4',
    name: 'Landslide - Uttarakhand',
    type: 'Landslide',
    status: 'ACTIVE' as const,
    location: 'Uttarakhand',
    activeVolunteers: 28,
    totalVolunteers: 30,
    tasksCompleted: 15,
    totalTasks: 20,
  },
];

const mockBurnoutAlerts = [
  {
    id: '1',
    volunteerName: 'Rohan Kumar',
    volunteerRole: 'Team Lead',
    riskLevel: 'critical' as const,
    hoursWorked: 18,
    lastBreak: '6 hours ago',
    disasterAssigned: 'Cyclone - Tamil Nadu',
    timestamp: new Date(Date.now() - 1 * 3600000),
  },
  {
    id: '2',
    volunteerName: 'Anita Sharma',
    volunteerRole: 'Medical Officer',
    riskLevel: 'high' as const,
    hoursWorked: 14,
    lastBreak: '4 hours ago',
    disasterAssigned: 'Flood - Karnataka',
    timestamp: new Date(Date.now() - 2 * 3600000),
  },
  {
    id: '3',
    volunteerName: 'Priya Singh',
    volunteerRole: 'Operations Manager',
    riskLevel: 'moderate' as const,
    hoursWorked: 10,
    lastBreak: '2 hours ago',
    disasterAssigned: 'Cyclone - Tamil Nadu',
    timestamp: new Date(Date.now() - 3 * 3600000),
  },
  {
    id: '4',
    volunteerName: 'Vikas Patel',
    volunteerRole: 'Rescue Coordinator',
    riskLevel: 'high' as const,
    hoursWorked: 16,
    lastBreak: '8 hours ago',
    disasterAssigned: 'Landslide - Uttarakhand',
    timestamp: new Date(Date.now() - 4 * 3600000),
  },
  {
    id: '5',
    volunteerName: 'Sarah Johnson',
    volunteerRole: 'Health Worker',
    riskLevel: 'moderate' as const,
    hoursWorked: 11,
    lastBreak: '3 hours ago',
    disasterAssigned: 'Earthquake - Himachal',
    timestamp: new Date(Date.now() - 5 * 3600000),
  },
];

const mockAnalytics = {
  taskCompletion: [
    { date: 'Mon', completed: 12, pending: 38 },
    { date: 'Tue', completed: 18, pending: 32 },
    { date: 'Wed', completed: 25, pending: 25 },
    { date: 'Thu', completed: 31, pending: 19 },
    { date: 'Fri', completed: 40, pending: 10 },
    { date: 'Sat', completed: 36, pending: 14 },
    { date: 'Sun', completed: 28, pending: 22 },
  ],
  volunteerActivity: [
    { date: 'Mon', active: 125, inactive: 17 },
    { date: 'Tue', active: 138, inactive: 12 },
    { date: 'Wed', active: 145, inactive: 8 },
    { date: 'Thu', active: 142, inactive: 10 },
    { date: 'Fri', active: 135, inactive: 15 },
    { date: 'Sat', active: 128, inactive: 18 },
    { date: 'Sun', active: 118, inactive: 24 },
  ],
  disasterDistribution: [
    { name: 'Flood', value: 8 },
    { name: 'Cyclone', value: 6 },
    { name: 'Earthquake', value: 4 },
    { name: 'Landslide', value: 3 },
    { name: 'Other', value: 2 },
  ],
  burnoutRisk: [
    { level: 'Low', count: 78 },
    { level: 'Moderate', count: 38 },
    { level: 'High', count: 20 },
    { level: 'Critical', count: 6 },
  ],
};

export default function DashboardPage() {
  const summaryQuery = useDashboardSummary();
  const activityQuery = useDashboardActivity();
  const analyticsQuery = useDashboardAnalytics();

  // Get data with fallback to mock
  const summaryData = summaryQuery.data || mockSummary;
  const activityData = activityQuery.data || mockActivity;
  const analyticsData = analyticsQuery.data || mockAnalytics;
  const isLoading = summaryQuery.isLoading || analyticsQuery.isLoading;

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4 sm:p-6 md:p-8 space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Command Center</h1>
          <p className="text-slate-600 mt-2">Real-time disaster operations overview</p>
        </div>

        {/* KPI Cards */}
        <DashboardSection title="Key Performance Indicators">
          {isLoading ? (
            <DashboardGrid cols={4} gap="md">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </DashboardGrid>
          ) : (
            <KPICards
              data={{
                activeDiasters: summaryData.activeDasasters,
                activeVolunteers: summaryData.activeVolunteers,
                tasksCompleted: summaryData.tasksCompletedToday,
                pendingTasks: summaryData.pendingTasks,
                burnoutAlerts: summaryData.burnoutAlerts,
                ivrCalls: summaryData.ivrCallsToday,
                syncFailures: summaryData.syncFailures,
                avgResponseTime: summaryData.avgResponseTime,
              }}
            />
          )}
        </DashboardSection>

        {/* Offline-First Sync Status */}
        <DashboardGrid cols={1}>
          {isLoading ? (
            <SkeletonCard lines={12} className="h-80" />
          ) : (
            <SyncSummaryPanel data={mockSyncData} />
          )}
        </DashboardGrid>

        {/* Operations Row */}
        <DashboardGrid cols={2} gap="lg">
          {/* Disaster Overview */}
          <DashboardSection title="Active Disasters">
            {isLoading ? (
              <DashboardGrid cols={2} gap="md">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} lines={5} />
                ))}
              </DashboardGrid>
            ) : mockDisasters.length === 0 ? (
              <EmptyState title="No disasters" message="No active or monitoring disasters at this time" />
             ) : (
               <DisasterOverview disasters={mockDisasters} />
            )}
          </DashboardSection>

          {/* Burnout Alerts */}
          <DashboardSection title="Volunteer Burnout">
            {isLoading ? (
              <SkeletonCard lines={8} className="h-96" />
             ) : (
               <BurnoutAlertPanel alerts={mockBurnoutAlerts} />
            )}
          </DashboardSection>
        </DashboardGrid>

        {/* Activity and Insights */}
        <DashboardGrid cols={2} gap="lg">
          {/* Recent Activity */}
          <DashboardSection title="Activity Stream">
            {isLoading ? (
              <SkeletonCard lines={10} className="h-96" />
            ) : activityData.length === 0 ? (
              <WidgetCard>
                <div className="p-6">
                  <EmptyState title="No recent activity" message="Activities will appear here as they happen" />
                </div>
              </WidgetCard>
             ) : (
               <ActivityFeed events={activityData} />
            )}
          </DashboardSection>

          {/* Charts */}
          <div className="space-y-6">
            <DashboardSection>
              {isLoading ? (
                <SkeletonCard lines={8} className="h-80" />
               ) : (
                 <TaskCompletionChart data={analyticsData.taskCompletion} />
              )}
            </DashboardSection>

            <DashboardSection>
              {isLoading ? (
                <SkeletonCard lines={8} className="h-80" />
               ) : (
                 <VolunteerActivityChart data={analyticsData.volunteerActivity} />
              )}
            </DashboardSection>
          </div>
        </DashboardGrid>

        {/* Bottom Charts */}
        <DashboardGrid cols={2} gap="lg">
          <DashboardSection>
            {isLoading ? (
              <SkeletonCard lines={8} className="h-80" />
             ) : (
               <DisasterDistributionChart data={analyticsData.disasterDistribution} />
            )}
          </DashboardSection>

          <DashboardSection>
            {isLoading ? (
              <SkeletonCard lines={8} className="h-80" />
             ) : (
               <BurnoutRiskChart data={analyticsData.burnoutRisk} />
            )}
          </DashboardSection>
        </DashboardGrid>

        {/* Volunteer Distribution Widget */}
        <DashboardSection title="Volunteer Distribution">
          {isLoading ? (
            <DashboardGrid cols={3} gap="md">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} lines={8} className="h-80" />
              ))}
            </DashboardGrid>
          ) : (
            <VolunteerDistributionWidget
              bySkills={[
                { name: 'First Aid', count: 45 },
                { name: 'Medical', count: 38 },
                { name: 'Rescue', count: 32 },
                { name: 'Relief', count: 27 },
              ]}
              byRegion={[
                { name: 'North', value: 35 },
                { name: 'South', value: 42 },
                { name: 'East', value: 38 },
                { name: 'West', value: 27 },
              ]}
              byAvailability={[
                { status: 'On-Duty', count: 95 },
                { status: 'On Standby', count: 32 },
                { status: 'Off-Duty', count: 12 },
                { status: 'On Leave', count: 3 },
              ]}
            />
          )}
        </DashboardSection>
      </div>
    </div>
  );
}
