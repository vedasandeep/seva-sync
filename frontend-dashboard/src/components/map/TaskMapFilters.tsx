/**
 * TaskMapFilters Component
 * 
 * Filtering controls for task map view
 * Status, urgency, disaster, assignment filters
 */

import { ChevronDown } from 'lucide-react';

type TaskStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type TaskUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface TaskMapFiltersProps {
  statusFilter: TaskStatus[];
  urgencyFilter: TaskUrgency[];
  onStatusChange: (status: TaskStatus[]) => void;
  onUrgencyChange: (urgency: TaskUrgency[]) => void;
  taskCount: number;
  filteredCount: number;
  className?: string;
}

const statusOptions: { label: string; value: TaskStatus }[] = [
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const urgencyOptions: { label: string; value: TaskUrgency; color: string }[] = [
  { label: 'Low', value: 'LOW', color: 'bg-blue-100 text-blue-800' },
  { label: 'Medium', value: 'MEDIUM', color: 'bg-amber-100 text-amber-800' },
  { label: 'High', value: 'HIGH', color: 'bg-orange-100 text-orange-800' },
  { label: 'Critical', value: 'CRITICAL', color: 'bg-red-100 text-red-800' },
];

/**
 * Filter controls for task map
 * - Status checkboxes
 * - Urgency badges
 * - Shows count of visible tasks
 */
export function TaskMapFilters({
  statusFilter,
  urgencyFilter,
  onStatusChange,
  onUrgencyChange,
  taskCount,
  filteredCount,
  className = '',
}: TaskMapFiltersProps) {
  const handleStatusToggle = (status: TaskStatus) => {
    if (statusFilter.includes(status)) {
      onStatusChange(statusFilter.filter((s) => s !== status));
    } else {
      onStatusChange([...statusFilter, status]);
    }
  };

  const handleUrgencyToggle = (urgency: TaskUrgency) => {
    if (urgencyFilter.includes(urgency)) {
      onUrgencyChange(urgencyFilter.filter((u) => u !== urgency));
    } else {
      onUrgencyChange([...urgencyFilter, urgency]);
    }
  };

  const handleReset = () => {
    onStatusChange(['OPEN', 'IN_PROGRESS']);
    onUrgencyChange([]);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {(statusFilter.length !== 2 || statusFilter.length !== 2) && (
          <button
            onClick={handleReset}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Reset
          </button>
        )}
      </div>

      {/* Task count */}
      <div className="mb-4 p-2 bg-gray-50 rounded text-sm text-gray-600">
        Showing {filteredCount} of {taskCount} tasks
      </div>

      {/* Status filter */}
      <div className="mb-4">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer font-medium text-gray-900 mb-2 hover:text-gray-700">
            Status
            <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="space-y-2 ml-2">
            {statusOptions.map(({ label, value }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={statusFilter.includes(value)}
                  onChange={() => handleStatusToggle(value)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </details>
      </div>

      {/* Urgency filter */}
      <div>
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer font-medium text-gray-900 mb-2 hover:text-gray-700">
            Urgency
            <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="space-y-2 ml-2">
            {urgencyOptions.map(({ label, value, color }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={urgencyFilter.includes(value)}
                  onChange={() => handleUrgencyToggle(value)}
                  className="rounded border-gray-300"
                />
                <span className={`text-xs font-medium px-2 py-1 rounded ${color}`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
