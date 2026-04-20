import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import Timeline, { TimelineEvent } from '../components/Timeline';

// Mock disaster detail data
const MOCK_DISASTER_DETAIL = {
  id: '1',
  name: 'Hyderabad Floods 2026',
  type: 'FLOOD',
  severity: 'CRITICAL',
  status: 'ACTIVE',
  location: 'Hyderabad, Telangana',
  latitude: 17.3850,
  longitude: 78.4867,
  startDate: new Date(Date.now() - 7 * 24 * 3600000),
  endDate: null,
  description: 'Major flooding event affecting multiple neighborhoods in Hyderabad city',
  totalTasks: 45,
  completedTasks: 23,
  openTasks: 22,
  assignedVolunteers: 12,
  burnoutAlerts: 3,
  responseTime: '12 min',
  activity: [
    {
      id: 'act1',
      type: 'activated' as const,
      title: 'Disaster Activated',
      description: 'Disaster was activated by Admin User',
      actor: 'System',
      timestamp: new Date(Date.now() - 7 * 24 * 3600000),
      severity: 'high',
    },
    {
      id: 'act2',
      type: 'task_added' as const,
      title: 'Tasks Created',
      description: '45 tasks were automatically created',
      actor: 'System',
      timestamp: new Date(Date.now() - 6.9 * 24 * 3600000),
    },
    {
      id: 'act3',
      type: 'volunteer_assigned' as const,
      title: '12 Volunteers Assigned',
      description: 'Volunteers were assigned based on availability',
      actor: 'Coordinator',
      timestamp: new Date(Date.now() - 6.5 * 24 * 3600000),
    },
    {
      id: 'act4',
      type: 'severity_changed' as const,
      title: 'Severity Changed to CRITICAL',
      description: 'Based on escalation assessment',
      actor: 'Admin',
      timestamp: new Date(Date.now() - 5 * 24 * 3600000),
      severity: 'critical',
    },
    {
      id: 'act5',
      type: 'task_completed' as const,
      title: '23 Tasks Completed',
      description: 'Multiple rescue and relief operations completed',
      actor: 'Volunteers',
      timestamp: new Date(Date.now() - 1 * 24 * 3600000),
    },
  ] as TimelineEvent[],
};

type TabType = 'overview' | 'tasks' | 'volunteers' | 'reports' | 'activity';

export default function DisasterDetailPage() {
  const { id: _id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const disaster = MOCK_DISASTER_DETAIL;

  const completionRate = Math.round((disaster.completedTasks / disaster.totalTasks) * 100);
  const severityColors: Record<string, string> = {
    LOW: 'bg-blue-100 text-blue-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
  };

  const statusColors: Record<string, string> = {
    PLANNING: 'bg-orange-100 text-orange-800',
    ACTIVE: 'bg-green-100 text-green-800',
    RESOLVED: 'bg-slate-100 text-slate-800',
    ARCHIVED: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header with Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Title Section */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{disaster.name}</h1>
            <p className="text-slate-600 mt-1">{disaster.type}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[disaster.status]}`}>
              {disaster.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${severityColors[disaster.severity]}`}>
              {disaster.severity}
            </span>
          </div>
        </div>

        {/* Location & Date */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4" />
            <span>{disaster.location}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>{disaster.startDate.toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
          <div className="text-2xl font-bold text-slate-900">{disaster.assignedVolunteers}</div>
          <div className="text-xs text-slate-600 mt-1">Volunteers</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
          <div className="text-2xl font-bold text-slate-900">{disaster.openTasks}</div>
          <div className="text-xs text-slate-600 mt-1">Open Tasks</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
          <div className="text-2xl font-bold text-slate-900">{completionRate}%</div>
          <div className="text-xs text-slate-600 mt-1">Completion</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
          <div className="text-2xl font-bold text-slate-900">{disaster.burnoutAlerts}</div>
          <div className="text-xs text-slate-600 mt-1">Burnout Alerts</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex gap-8 overflow-x-auto">
          {(['overview', 'tasks', 'volunteers', 'reports', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Overview</h2>
              <p className="text-slate-600">{disaster.description}</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Completion Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    {disaster.completedTasks} of {disaster.totalTasks} tasks completed
                  </span>
                  <span className="font-semibold text-slate-900">{completionRate}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Average Response Time</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{disaster.responseTime}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Volunteer Utilization</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {Math.round((disaster.assignedVolunteers / 25) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Tasks</h2>
            <p className="text-slate-600">Task management view coming soon</p>
          </div>
        )}

        {activeTab === 'volunteers' && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Volunteers</h2>
            <p className="text-slate-600">Volunteer management view coming soon</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Reports</h2>
            <p className="text-slate-600">Analytics and reporting coming soon</p>
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Activity Log</h2>
            <Timeline events={disaster.activity} />
          </div>
        )}
      </div>
    </div>
  );
}
