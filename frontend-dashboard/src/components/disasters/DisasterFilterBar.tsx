import { useState, useCallback, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';

export interface DisasterFilters {
  status?: string;
  severity?: string;
  type?: string;
  sortBy?: string;
  search?: string;
}

interface Props {
  onSearchChange: (query: string) => void;
  onFilterChange: (filters: DisasterFilters) => void;
  onSortChange: (sortBy: string) => void;
  currentFilters: DisasterFilters;
  currentSort?: string;
  isLoading?: boolean;
}

const DISASTER_TYPES = ['FLOOD', 'CYCLONE', 'EARTHQUAKE', 'LANDSLIDE', 'FIRE', 'OTHER'];
const DISASTER_STATUS = ['PLANNING', 'ACTIVE', 'RESOLVED', 'ARCHIVED'];
const DISASTER_SEVERITY = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most-severe', label: 'Most Severe' },
  { value: 'least-severe', label: 'Least Severe' },
  { value: 'most-volunteers', label: 'Most Volunteers' },
  { value: 'most-open-tasks', label: 'Most Open Tasks' },
];

export default function DisasterFilterBar({
  onSearchChange,
  onFilterChange,
  onSortChange,
  currentFilters,
  currentSort = 'newest',
  isLoading = false,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<DisasterFilters>(currentFilters);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, onSearchChange]);

  const handleFilterChange = useCallback(
    (key: keyof DisasterFilters, value: string | undefined) => {
      const newFilters = { ...filters, [key]: value };
      if (!value) {
        delete newFilters[key];
      }
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({});
    onSearchChange('');
    onFilterChange({});
    setShowFilters(false);
  };

  const hasActiveFilters =
    Object.keys(filters).length > 0 || searchQuery.length > 0;

  return (
    <div className="space-y-3 mb-6 bg-white p-4 rounded-lg border border-slate-200">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search disasters by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
          />
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
            hasActiveFilters
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
          }`}
          disabled={isLoading}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>

        {/* Sort Dropdown */}
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value)}
          disabled={isLoading}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-50 bg-white"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            disabled={isLoading}
            className="px-3 py-2 text-slate-700 text-sm font-medium hover:text-red-600 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-200">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            >
              <option value="">All Status</option>
              {DISASTER_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Severity
            </label>
            <select
              value={filters.severity || ''}
              onChange={(e) => handleFilterChange('severity', e.target.value || undefined)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            >
              <option value="">All Severity</option>
              {DISASTER_SEVERITY.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Type
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            >
              <option value="">All Types</option>
              {DISASTER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-1 items-end">
            {Object.entries(filters).map(([key, value]) =>
              value ? (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium"
                >
                  {key}: {value}
                  <button
                    onClick={() => handleFilterChange(key as keyof DisasterFilters, undefined)}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  );
}
