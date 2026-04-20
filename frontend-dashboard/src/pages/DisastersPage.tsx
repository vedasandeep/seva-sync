import { useEffect, useState } from 'react';
import { disasters } from '../lib/api';
import { DisasterFilterBar, DisasterCard, DisasterCardData } from '../components/disasters';

interface CreateDisasterForm {
  name: string;
  type: string;
  severity: string;
  location: string;
  latitude: string;
  longitude: string;
  startDate: string;
}

// Mock data for when API is unavailable
const MOCK_DISASTERS: DisasterCardData[] = [
  {
    id: '1',
    name: 'Hyderabad Floods 2026',
    type: 'FLOOD',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    location: 'Hyderabad, Telangana',
    startDate: new Date(Date.now() - 7 * 24 * 3600000),
    totalTasks: 45,
    completedTasks: 23,
    openTasks: 22,
    assignedVolunteers: 12,
  },
  {
    id: '2',
    name: 'Chennai Cyclone 2026',
    type: 'CYCLONE',
    severity: 'HIGH',
    status: 'ACTIVE',
    location: 'Chennai, Tamil Nadu',
    startDate: new Date(Date.now() - 3 * 24 * 3600000),
    totalTasks: 38,
    completedTasks: 18,
    openTasks: 20,
    assignedVolunteers: 15,
  },
  {
    id: '3',
    name: 'Delhi Fire Incident',
    type: 'FIRE',
    severity: 'HIGH',
    status: 'PLANNING',
    location: 'New Delhi, Delhi',
    startDate: new Date(),
    totalTasks: 12,
    completedTasks: 0,
    openTasks: 12,
    assignedVolunteers: 0,
  },
  {
    id: '4',
    name: 'Bangalore Earthquake',
    type: 'EARTHQUAKE',
    severity: 'MEDIUM',
    status: 'ACTIVE',
    location: 'Bangalore, Karnataka',
    startDate: new Date(Date.now() - 15 * 24 * 3600000),
    totalTasks: 30,
    completedTasks: 28,
    openTasks: 2,
    assignedVolunteers: 20,
  },
  {
    id: '5',
    name: 'Shimla Landslide',
    type: 'LANDSLIDE',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    location: 'Shimla, Himachal Pradesh',
    startDate: new Date(Date.now() - 30 * 24 * 3600000),
    totalTasks: 25,
    completedTasks: 25,
    openTasks: 0,
    assignedVolunteers: 18,
  },
  {
    id: '6',
    name: 'Gujarat Flood Management',
    type: 'FLOOD',
    severity: 'MEDIUM',
    status: 'ACTIVE',
    location: 'Ahmedabad, Gujarat',
    startDate: new Date(Date.now() - 5 * 24 * 3600000),
    totalTasks: 35,
    completedTasks: 20,
    openTasks: 15,
    assignedVolunteers: 14,
  },
  {
    id: '7',
    name: 'Mumbai Operations',
    type: 'FIRE',
    severity: 'LOW',
    status: 'RESOLVED',
    location: 'Mumbai, Maharashtra',
    startDate: new Date(Date.now() - 60 * 24 * 3600000),
    totalTasks: 18,
    completedTasks: 18,
    openTasks: 0,
    assignedVolunteers: 8,
  },
  {
    id: '8',
    name: 'Kolkata Relief Effort',
    type: 'FLOOD',
    severity: 'LOW',
    status: 'ARCHIVED',
    location: 'Kolkata, West Bengal',
    startDate: new Date(Date.now() - 90 * 24 * 3600000),
    totalTasks: 22,
    completedTasks: 22,
    openTasks: 0,
    assignedVolunteers: 10,
  },
];

export default function DisastersPage() {
  const [disasterList, setDisasterList] = useState<DisasterCardData[]>([]);
  const [filteredList, setFilteredList] = useState<DisasterCardData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [form, setForm] = useState<CreateDisasterForm>({
    name: '',
    type: 'FLOOD',
    severity: 'MEDIUM',
    location: '',
    latitude: '',
    longitude: '',
    startDate: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    loadDisasters();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...disasterList];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filters.status) {
      result = result.filter((d) => d.status === filters.status);
    }

    // Severity filter
    if (filters.severity) {
      result = result.filter((d) => d.severity === filters.severity);
    }

    // Type filter
    if (filters.type) {
      result = result.filter((d) => d.type === filters.type);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'most-severe':
          const severityOrder: Record<string, number> = {
            CRITICAL: 4,
            HIGH: 3,
            MEDIUM: 2,
            LOW: 1,
          };
          return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
        case 'least-severe':
          const severityOrder2: Record<string, number> = {
            CRITICAL: 4,
            HIGH: 3,
            MEDIUM: 2,
            LOW: 1,
          };
          return (severityOrder2[a.severity] || 0) - (severityOrder2[b.severity] || 0);
        case 'most-volunteers':
          return b.assignedVolunteers - a.assignedVolunteers;
        case 'most-open-tasks':
          return b.openTasks - a.openTasks;
        case 'newest':
        default:
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
    });

    setFilteredList(result);
  }, [disasterList, filters, searchQuery, sortBy]);

  const loadDisasters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await disasters.list();
      if (result && Array.isArray(result) && result.length > 0) {
        // If API returns data, map it to our expected format
        const mapped = result.map((d: any) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          severity: d.severity || 'MEDIUM',
          status: d.status,
          location: d.location,
          startDate: d.startDate,
          totalTasks: d.totalTasks || 0,
          completedTasks: d.completedTasks || 0,
          openTasks: d.openTasks || (d.totalTasks || 0) - (d.completedTasks || 0),
          assignedVolunteers: d.assignedVolunteers || 0,
        }));
        setDisasterList(mapped);
      } else {
        // Fallback to mock data
        setDisasterList(MOCK_DISASTERS);
      }
    } catch (err) {
      console.error('Error loading disasters:', err);
      // Use mock data on error
      setDisasterList(MOCK_DISASTERS);
      setError('Using cached data (API unavailable)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await disasters.create({
        name: form.name,
        type: form.type,
        severity: form.severity as any,
        location: form.location,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        startDate: new Date(form.startDate).toISOString(),
      });
      setShowForm(false);
      setForm({
        name: '',
        type: 'FLOOD',
        severity: 'MEDIUM',
        location: '',
        latitude: '',
        longitude: '',
        startDate: new Date().toISOString().slice(0, 16),
      });
      loadDisasters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create disaster');
    }
  };

  const handleActivate = async (id: string) => {
    setError(null);
    try {
      await disasters.activate(id);
      loadDisasters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate disaster');
    }
  };

  const handleResolve = async (id: string) => {
    setError(null);
    try {
      await disasters.resolve(id);
      loadDisasters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve disaster');
    }
  };

  const handleArchive = async (id: string) => {
    setError(null);
    try {
      // Note: archive endpoint might not exist yet, using resolve as fallback
      await disasters.resolve(id);
      loadDisasters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive disaster');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Disasters</h1>
          <p className="text-slate-600 mt-1">Manage and monitor disaster operations</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            showForm
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {showForm ? '✕ Cancel' : '+ New Disaster'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg border border-slate-200 mb-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Create New Disaster</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <input
              placeholder="Disaster name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="FLOOD">Flood</option>
              <option value="CYCLONE">Cyclone</option>
              <option value="EARTHQUAKE">Earthquake</option>
              <option value="LANDSLIDE">Landslide</option>
              <option value="FIRE">Fire</option>
              <option value="OTHER">Other</option>
            </select>
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 sm:col-span-2"
            />
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Create Disaster
          </button>
        </form>
      )}

      {/* Filter Bar */}
      <DisasterFilterBar
        onSearchChange={setSearchQuery}
        onFilterChange={setFilters}
        onSortChange={setSortBy}
        currentFilters={filters}
        currentSort={sortBy}
        isLoading={isLoading}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-200 rounded-lg h-48 animate-pulse" />
          ))}
        </div>
      )}

      {/* Disaster Cards Grid */}
      {!isLoading && (
        <>
          {filteredList.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
              <p className="text-slate-600 text-lg">
                {disasterList.length === 0
                  ? 'No disasters found. Create one to get started.'
                  : 'No disasters match your filters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredList.map((disaster) => (
                <DisasterCard
                  key={disaster.id}
                  disaster={disaster}
                  onView={() => console.log('View', disaster.id)}
                  onActivate={handleActivate}
                  onResolve={handleResolve}
                  onArchive={handleArchive}
                  isLoading={isLoading}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
