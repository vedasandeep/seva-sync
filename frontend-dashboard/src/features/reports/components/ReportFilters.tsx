import React, { useState } from 'react';
import { Calendar, Filter, X } from 'lucide-react';

export interface ReportFilterOptions {
  dateRange: 'all' | '7days' | '30days' | '90days';
  reportType?: string;
  disasterId?: string;
  volunteerId?: string;
  status?: string;
}

interface ReportFiltersProps {
  onFilterChange?: (filters: ReportFilterOptions) => void;
  reportTypes?: Array<{ id: string; name: string }>;
  disasters?: Array<{ id: string; name: string }>;
  volunteers?: Array<{ id: string; name: string }>;
  showReportType?: boolean;
  showDisaster?: boolean;
  showVolunteer?: boolean;
  showStatus?: boolean;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  onFilterChange,
  reportTypes = [],
  disasters = [],
  volunteers = [],
  showReportType = true,
  showDisaster = true,
  showVolunteer = false,
  showStatus = false,
}) => {
  const [filters, setFilters] = useState<ReportFilterOptions>({
    dateRange: 'all',
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleDateRangeChange = (dateRange: ReportFilterOptions['dateRange']) => {
    const newFilters = { ...filters, dateRange };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleFilterChange = (key: keyof ReportFilterOptions, value: string | undefined) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v && v !== 'all'
  ).length;

  const dateRangeLabels: Record<string, string> = {
    all: 'All Time',
    '7days': 'Last 7 Days',
    '30days': 'Last 30 Days',
    '90days': 'Last 90 Days',
  };

  const resetFilters = () => {
    setFilters({ dateRange: 'all' });
    onFilterChange?.({ dateRange: 'all' });
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Mobile-friendly header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Filter size={16} />
          Filters
        </h3>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <X size={14} />
            Reset
          </button>
        )}
      </div>

      {/* Date Range - Always visible */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(dateRangeLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleDateRangeChange(key as ReportFilterOptions['dateRange'])}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              filters.dateRange === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Expandable advanced filters */}
      {(showReportType || showDisaster || showVolunteer || showStatus) && (
        <div className="border-t pt-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2"
          >
            <Calendar size={16} />
            Advanced Filters
            <span
              className={`ml-auto transform transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </button>

          {isOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {showReportType && reportTypes.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Report Type
                  </label>
                  <select
                    value={filters.reportType || ''}
                    onChange={(e) =>
                      handleFilterChange('reportType', e.target.value || undefined)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">All Reports</option>
                    {reportTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {showDisaster && disasters.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Disaster
                  </label>
                  <select
                    value={filters.disasterId || ''}
                    onChange={(e) =>
                      handleFilterChange('disasterId', e.target.value || undefined)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">All Disasters</option>
                    {disasters.map((disaster) => (
                      <option key={disaster.id} value={disaster.id}>
                        {disaster.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {showVolunteer && volunteers.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Volunteer
                  </label>
                  <select
                    value={filters.volunteerId || ''}
                    onChange={(e) =>
                      handleFilterChange('volunteerId', e.target.value || undefined)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">All Volunteers</option>
                    {volunteers.map((volunteer) => (
                      <option key={volunteer.id} value={volunteer.id}>
                        {volunteer.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {showStatus && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) =>
                      handleFilterChange('status', e.target.value || undefined)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.reportType && (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200">
              Report: {reportTypes.find((t) => t.id === filters.reportType)?.name}
              <button
                onClick={() => handleFilterChange('reportType', undefined)}
                className="hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}
          {filters.disasterId && (
            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full border border-green-200">
              Disaster: {disasters.find((d) => d.id === filters.disasterId)?.name}
              <button
                onClick={() => handleFilterChange('disasterId', undefined)}
                className="hover:text-green-900"
              >
                ×
              </button>
            </span>
          )}
          {filters.volunteerId && (
            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full border border-purple-200">
              Volunteer: {volunteers.find((v) => v.id === filters.volunteerId)?.name}
              <button
                onClick={() => handleFilterChange('volunteerId', undefined)}
                className="hover:text-purple-900"
              >
                ×
              </button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full border border-orange-200">
              Status: {filters.status}
              <button
                onClick={() => handleFilterChange('status', undefined)}
                className="hover:text-orange-900"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportFilters;
