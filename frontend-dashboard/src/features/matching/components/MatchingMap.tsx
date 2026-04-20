/**
 * MatchingMap Component
 * 
 * Displays volunteer-to-task matching visualization with distance overlay
 * Shows selected task and nearby available volunteers with match scores
 */

import { useState } from 'react';
import { Circle } from 'react-leaflet';
import { MapContainer } from '../../../components/map/MapContainer';
import { VolunteerMarker } from '../../../components/map/VolunteerMarker';
import { TaskMarker } from '../../../components/map/TaskMarker';
import { MapLegend } from '../../../components/map/MapLegend';
import { Volunteer } from '../../../types/volunteer';
import { Task } from '../../../types/task';
import { calculateDistance } from '../../../lib/geoUtils';

interface MatchingMapProps {
  task: Task;
  volunteers: Volunteer[];
  loading?: boolean;
  onVolunteerSelect?: (volunteer: Volunteer) => void;
  center?: [number, number];
  zoom?: number;
  radiusKm?: number;
  className?: string;
}

/**
 * Visualizes volunteer-to-task matching with distance
 * - Task shown as center pin
 * - Volunteers shown with match scores as labels
 * - Distance radius overlay (default 10km)
 * - Color intensity indicates match score quality
 */
export function MatchingMap({
  task,
  volunteers,
  loading = false,
  onVolunteerSelect,
  center,
  zoom = 10,
  radiusKm = 10,
  className = '',
}: MatchingMapProps) {
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

  // Calculate distances for all volunteers relative to task
  const volunteersWithDistance = volunteers
    .map((v) => ({
      ...v,
      distance: calculateDistance(task.latitude, task.longitude, v.currentLat, v.currentLng),
    }))
    .filter((v) => v.distance <= radiusKm)
    .sort((a, b) => (a.matchScore || 0) - (b.matchScore || 0));

  const mapCenter: [number, number] = center || [Number(task.latitude), Number(task.longitude)];

  const handleVolunteerClick = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    onVolunteerSelect?.(volunteer);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <MapContainer center={mapCenter} zoom={zoom} loading={loading}>
        {/* Distance radius overlay */}
        <Circle
          center={mapCenter}
          radius={radiusKm * 1000}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.05,
            weight: 2,
            dashArray: '3, 3',
          }}
        />

        {/* Task marker at center */}
        <TaskMarker task={task} />

        {/* Volunteer markers with distances */}
        {volunteersWithDistance.map((volunteer) => (
          <VolunteerMarker
            key={volunteer.id}
            volunteer={volunteer}
            selected={selectedVolunteer?.id === volunteer.id}
            onClick={handleVolunteerClick}
            showRadius={false}
          />
        ))}

        <MapLegend
          showVolunteers={true}
          showTasks={true}
          showDisasters={false}
          showHeatmap={false}
          position="topleft"
        />
      </MapContainer>

      {/* Info panel */}
      {volunteersWithDistance.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg pointer-events-none">
          <p className="text-gray-600 font-medium">No volunteers within {radiusKm}km</p>
        </div>
      )}
    </div>
  );
}
