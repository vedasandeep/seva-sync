/**
 * TaskMap Component
 * 
 * Displays task locations on map with status and urgency filtering
 * Primary map view for the Tasks page
 */

import { useMemo, useState } from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapContainer } from './MapContainer';
import { TaskMarker } from './TaskMarker';
import { MapLegend } from './MapLegend';
import { Task } from '../../types/task';

type TaskStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type TaskUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface TaskMapProps {
  tasks: Task[];
  loading?: boolean;
  onTaskSelect?: (task: Task) => void;
  center?: [number, number];
  zoom?: number;
  statusFilter?: TaskStatus[];
  urgencyFilter?: TaskUrgency[];
  className?: string;
}

/**
 * Map view for task locations with filtering
 * - Default shows OPEN and IN_PROGRESS tasks only
 * - Color-coded by urgency
 * - Icon changes by status (◉ open, ◐ in progress, ✓ completed)
 * - Cluster support for many markers
 */
export function TaskMap({
  tasks,
  loading = false,
  onTaskSelect,
  center = [20, 78],
  zoom = 6,
  statusFilter = ['OPEN', 'IN_PROGRESS'],
  urgencyFilter = [],
  className = '',
}: TaskMapProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filter tasks based on criteria
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Default filter: OPEN and IN_PROGRESS only
      const statusMatches =
        statusFilter.length === 0 || statusFilter.includes(task.status as TaskStatus);
      const urgencyMatches =
        urgencyFilter.length === 0 || urgencyFilter.includes(task.urgency as TaskUrgency);

      return statusMatches && urgencyMatches;
    });
  }, [tasks, statusFilter, urgencyFilter]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    onTaskSelect?.(task);
  };

  return (
    <div className={`relative w-full ${className}`}>
      {filteredTasks.length > 0 ? (
        <MapContainer center={center} zoom={zoom} loading={loading}>
          <MarkerClusterGroup
            chunkedLoading={true}
            maxClusterRadius={50}
          >
            {filteredTasks.map((task) => (
              <TaskMarker
                key={task.id}
                task={task}
                selected={selectedTask?.id === task.id}
                onClick={handleTaskClick}
              />
            ))}
          </MarkerClusterGroup>
          <MapLegend
            showVolunteers={false}
            showTasks={true}
            showDisasters={false}
            showHeatmap={false}
            position="topleft"
          />
        </MapContainer>
      ) : (
        <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 font-medium">No tasks to display</p>
            <p className="text-sm text-gray-500 mt-1">
              Adjust filters to see more tasks
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
