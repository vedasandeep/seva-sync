import { useState } from 'react';
import {
  DashboardSection,
  WidgetCard,
} from '../components/dashboard';
import { Download, FileText, BarChart3, TrendingUp, Users, Phone } from 'lucide-react';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  metrics: string[];
}

const REPORT_TYPES: ReportType[] = [
  {
    id: 'ivr-summary',
    name: 'IVR Call Summary',
    description: 'Complete IVR call activity, success rates, and volunteer adoption',
    icon: <Phone size={24} />,
    color: 'blue',
    metrics: ['Total Calls', 'Success Rate', 'Avg Duration', 'Volunteers', 'Languages'],
  },
  {
    id: 'volunteer-performance',
    name: 'Volunteer Performance',
    description: 'Task completion rates, hours logged, and impact per volunteer',
    icon: <Users size={24} />,
    color: 'green',
    metrics: ['Tasks Completed', 'Hours Logged', 'Avg Hours/Task', 'Burnout Risk', 'Impact Score'],
  },
  {
    id: 'task-analytics',
    name: 'Task Analytics',
    description: 'Task distribution, completion trends, and assignment patterns',
    icon: <BarChart3 size={24} />,
    color: 'purple',
    metrics: ['Total Tasks', 'Completed', 'Pending', 'Avg Time', 'By Disaster'],
  },
  {
    id: 'impact-metrics',
    name: 'Impact Metrics',
    description: 'People helped, resources distributed, and disaster response outcomes',
    icon: <TrendingUp size={24} />,
    color: 'amber',
    metrics: ['People Helped', 'Resources Dist.', 'Hours Volunteer', 'By Disaster', 'Effectiveness'],
  },
  {
    id: 'disaster-report',
    name: 'Disaster Report',
    description: 'Response timeline, volunteer mobilization, and outcomes by disaster',
    icon: <FileText size={24} />,
    color: 'red',
    metrics: ['Active Disasters', 'Volunteers/Disaster', 'Tasks/Disaster', 'Status', 'Timeline'],
  },
  {
    id: 'sync-report',
    name: 'Data Sync Report',
    description: 'Offline sync performance, conflicts, and data consistency metrics',
    icon: <Download size={24} />,
    color: 'indigo',
    metrics: ['Sync Events', 'Success Rate', 'Conflicts', 'Devices', 'Latest Sync'],
  },
];

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: 'bg-blue-100 text-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', icon: 'bg-green-100 text-green-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', icon: 'bg-purple-100 text-purple-600' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', icon: 'bg-amber-100 text-amber-600' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', icon: 'bg-red-100 text-red-600' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900', icon: 'bg-indigo-100 text-indigo-600' },
  };
  return colors[color] || colors.blue;
};

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month');

  const handleExportPDF = (reportId: string) => {
    console.log(`Exporting ${reportId} as PDF`);
    // Phase 3b: PDF export implementation
  };

  const handleExportCSV = (reportId: string) => {
    console.log(`Exporting ${reportId} as CSV`);
    // Phase 3c: CSV export implementation
  };

  const selectedReportData = selectedReport
    ? REPORT_TYPES.find((r) => r.id === selectedReport)
    : null;

  return (
    <DashboardSection>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">
          Generate comprehensive reports on volunteer activity, task completion, and disaster impact
        </p>
      </div>

      {/* Date Range Filter */}
      <WidgetCard className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Period</h2>
          <div className="flex gap-3">
            {[
              { value: 'week', label: 'Last 7 Days' },
              { value: 'month', label: 'Last 30 Days' },
              { value: 'quarter', label: 'Last 90 Days' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value as 'week' | 'month' | 'quarter')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  dateRange === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </WidgetCard>

      {/* Report Cards Grid */}
      {!selectedReport ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {REPORT_TYPES.map((report) => {
              const colors = getColorClasses(report.color);
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className="cursor-pointer transform transition-transform hover:scale-105"
                >
                  <WidgetCard interactive>
                    <div className="p-6">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colors.icon}`}>
                        {report.icon}
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{report.description}</p>

                      {/* Metrics Preview */}
                      <div className="space-y-1 mb-4">
                        {report.metrics.map((metric) => (
                          <div key={metric} className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            {metric}
                          </div>
                        ))}
                      </div>

                      {/* View Button */}
                      <button className={`w-full py-2 rounded-lg font-medium text-sm ${colors.bg} ${colors.text} hover:opacity-80 transition-opacity`}>
                        Generate Report →
                      </button>
                    </div>
                  </WidgetCard>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <WidgetCard>
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
              <div>
                <p className="text-sm text-gray-600">Total Reports Generated</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">128</p>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">PDF Exports</p>
                <p className="text-3xl font-bold text-green-600 mt-2">89</p>
                <p className="text-xs text-gray-500 mt-1">Most popular</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">CSV Exports</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">39</p>
                <p className="text-xs text-gray-500 mt-1">For analysis</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Export Time</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">2.3s</p>
                <p className="text-xs text-gray-500 mt-1">Quick generation</p>
              </div>
            </div>
          </WidgetCard>
        </>
      ) : (
        <>
          {/* Report Detail View */}
          <WidgetCard className="mb-6">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedReport(null)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                ← Back to Reports
              </button>
              <h2 className="text-2xl font-bold text-gray-900">{selectedReportData?.name}</h2>
              <div className="w-20" />
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6">{selectedReportData?.description}</p>

              {/* Report Preview (Mock Data) */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Report Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedReportData?.metrics.map((metric) => (
                    <div key={metric} className="bg-white p-4 rounded-lg border border-slate-200">
                      <p className="text-xs text-gray-600">{metric}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {Math.floor(Math.random() * 1000)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="bg-gray-100 rounded-lg h-64 mb-6 flex items-center justify-center">
                <p className="text-gray-500">Chart visualization (implemented in Phase 3b)</p>
              </div>

              {/* Export Options */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleExportPDF(selectedReport)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <FileText size={18} />
                  Export as PDF
                </button>
                <button
                  onClick={() => handleExportCSV(selectedReport)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Download size={18} />
                  Export as CSV
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </WidgetCard>
        </>
      )}
    </DashboardSection>
  );
}
