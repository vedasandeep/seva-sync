import { useState, useMemo } from 'react';
import {
  DashboardSection,
  WidgetCard,
} from '../components/dashboard';
import { ArrowUpRight, ArrowDownLeft, Phone, Download } from 'lucide-react';

interface CallHistoryRecord {
  id: string;
  volunteerId: string;
  volunteerName: string;
  callSid: string;
  direction: 'INBOUND' | 'OUTBOUND';
  actionType: string;
  duration: number;
  status: 'completed' | 'failed' | 'missed' | 'in_progress';
  inputValue?: string;
  language: string;
  timestamp: Date;
}

// Mock call history data
const MOCK_CALL_HISTORY: CallHistoryRecord[] = [
  {
    id: 'call-001',
    volunteerId: 'vol-001',
    volunteerName: 'Priya Singh',
    callSid: 'CA-1713610200000',
    direction: 'INBOUND',
    actionType: 'get_tasks',
    duration: 145,
    status: 'completed',
    inputValue: '1',
    language: 'hi',
    timestamp: new Date(Date.now() - 5 * 60000),
  },
  {
    id: 'call-002',
    volunteerId: 'vol-002',
    volunteerName: 'Rohan Kumar',
    callSid: 'CA-1713610300000',
    direction: 'INBOUND',
    actionType: 'log_hours',
    duration: 89,
    status: 'completed',
    inputValue: '2',
    language: 'en',
    timestamp: new Date(Date.now() - 15 * 60000),
  },
  {
    id: 'call-003',
    volunteerId: 'vol-003',
    volunteerName: 'Anita Sharma',
    callSid: 'CA-1713610400000',
    direction: 'INBOUND',
    actionType: 'wellness_checkin',
    duration: 52,
    status: 'completed',
    inputValue: '3',
    language: 'hi',
    timestamp: new Date(Date.now() - 45 * 60000),
  },
  {
    id: 'call-004',
    volunteerId: 'vol-001',
    volunteerName: 'Priya Singh',
    callSid: 'CA-1713610500000',
    direction: 'INBOUND',
    actionType: 'get_tasks',
    duration: 0,
    status: 'failed',
    language: 'hi',
    timestamp: new Date(Date.now() - 2 * 3600000),
  },
  {
    id: 'call-005',
    volunteerId: 'vol-002',
    volunteerName: 'Rohan Kumar',
    callSid: 'CA-1713610600000',
    direction: 'OUTBOUND',
    actionType: 'wellness_checkin',
    duration: 120,
    status: 'completed',
    language: 'en',
    timestamp: new Date(Date.now() - 4 * 3600000),
  },
  {
    id: 'call-006',
    volunteerId: 'vol-003',
    volunteerName: 'Anita Sharma',
    callSid: 'CA-1713610700000',
    direction: 'INBOUND',
    actionType: 'get_tasks',
    duration: 0,
    status: 'missed',
    language: 'hi',
    timestamp: new Date(Date.now() - 8 * 3600000),
  },
];

export default function IvrCallHistoryPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDirection, setFilterDirection] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter and search
  const filteredCalls = useMemo(() => {
    return MOCK_CALL_HISTORY.filter((call) => {
      const matchesStatus = filterStatus === 'all' || call.status === filterStatus;
      const matchesDirection = filterDirection === 'all' || call.direction === filterDirection;
      const matchesLanguage = filterLanguage === 'all' || call.language === filterLanguage;
      const matchesSearch =
        searchTerm === '' ||
        call.volunteerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.callSid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.actionType.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesDirection && matchesLanguage && matchesSearch;
    });
  }, [filterStatus, filterDirection, filterLanguage, searchTerm]);

  // Calculate summary stats
  const stats = {
    total: MOCK_CALL_HISTORY.length,
    completed: MOCK_CALL_HISTORY.filter((c) => c.status === 'completed').length,
    failed: MOCK_CALL_HISTORY.filter((c) => c.status === 'failed').length,
    missed: MOCK_CALL_HISTORY.filter((c) => c.status === 'missed').length,
    avgDuration: Math.round(
      MOCK_CALL_HISTORY.filter((c) => c.duration > 0).reduce((sum, c) => sum + c.duration, 0) /
        MOCK_CALL_HISTORY.filter((c) => c.duration > 0).length
    ),
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'missed':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'get_tasks':
        return 'Get Tasks';
      case 'log_hours':
        return 'Log Hours';
      case 'wellness_checkin':
        return 'Wellness Check';
      default:
        return actionType;
    }
  };

  return (
    <DashboardSection>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">IVR Call History</h1>
        <p className="text-gray-600 mt-2">View and analyze all incoming and outgoing IVR calls</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Calls', value: stats.total, color: 'blue' },
          { label: 'Completed', value: stats.completed, color: 'green' },
          { label: 'Failed', value: stats.failed, color: 'red' },
          { label: 'Missed', value: stats.missed, color: 'gray' },
          { label: 'Avg Duration', value: `${stats.avgDuration}s`, color: 'purple' },
        ].map((stat) => (
          <WidgetCard key={stat.label}>
            <div className="p-4">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 text-${stat.color}-600`}>{stat.value}</p>
            </div>
          </WidgetCard>
        ))}
      </div>

      {/* Filters */}
      <WidgetCard className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Name or Call ID
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-gray-900"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="missed">Missed</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>

            {/* Direction Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Direction</label>
              <select
                value={filterDirection}
                onChange={(e) => setFilterDirection(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-gray-900"
              >
                <option value="all">All Directions</option>
                <option value="INBOUND">Inbound</option>
                <option value="OUTBOUND">Outbound</option>
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-gray-900"
              >
                <option value="all">All Languages</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>
        </div>
      </WidgetCard>

      {/* Call History Table */}
      <WidgetCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Volunteer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Call ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Direction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{call.volunteerName}</div>
                    <div className="text-xs text-gray-500">{call.language.toUpperCase()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-mono text-xs text-gray-600">{call.callSid}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {call.direction === 'INBOUND' ? (
                        <ArrowDownLeft size={16} className="text-blue-600" />
                      ) : (
                        <ArrowUpRight size={16} className="text-green-600" />
                      )}
                      <span className="text-sm text-gray-700">{call.direction}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{getActionLabel(call.actionType)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{formatDuration(call.duration)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                      {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {call.timestamp.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCalls.length === 0 && (
            <div className="p-8 text-center">
              <Phone size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">No calls match your filters</p>
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="border-t border-slate-200 p-6 flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <Download size={18} />
            Export as CSV
          </button>
        </div>
      </WidgetCard>
    </DashboardSection>
  );
}
