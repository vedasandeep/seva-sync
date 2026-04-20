/**
 * VolunteerMap Component
 * 
 * Displays volunteer locations on map with marker clustering
 * Color-coded by burnout score, shows availability radius
 */

import { useState } from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapContainer } from './MapContainer';
import { VolunteerMarker } from './VolunteerMarker';
import { MapLegend } from './MapLegend';
import { Volunteer } from '../../types/volunteer';

interface VolunteerMapProps {
  volunteers: Volunteer[];
  loading?: boolean;
  onVolunteerSelect?: (volunteer: Volunteer) => void;
  center?: [number, number];
  zoom?: number;
  showRadius?: boolean;
  disasterId?: string;
  className?: string;
}

/**
 * Map view for volunteer locations with marker clustering
 * - Auto-clusters markers when zoomed out
 * - Shows individual markers when zoomed in
 * - Color-coded by burnout score
 * - Optional availability radius visualization
 */
export function VolunteerMap({
  volunteers,
  loading = false,
  onVolunteerSelect,
  center = [20, 78],
  zoom = 6,
  showRadius = false,
  className = '',
}: VolunteerMapProps) {
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

  const handleVolunteerClick = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    onVolunteerSelect?.(volunteer);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <MapContainer center={center} zoom={zoom} loading={loading}>
        <MarkerClusterGroup
          chunkedLoading={true}
          maxClusterRadius={50}
        >
          {volunteers.map((volunteer) => (
            <VolunteerMarker
              key={volunteer.id}
              volunteer={volunteer}
              selected={selectedVolunteer?.id === volunteer.id}
              onClick={handleVolunteerClick}
              showRadius={showRadius}
            />
          ))}
        </MarkerClusterGroup>
        <MapLegend
          showVolunteers={true}
          showTasks={false}
          showDisasters={false}
          showHeatmap={false}
          position="topleft"
        />
      </MapContainer>
    </div>
  );
}
