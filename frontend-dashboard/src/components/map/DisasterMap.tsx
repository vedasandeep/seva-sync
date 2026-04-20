/**
 * DisasterMap Component
 * 
 * Displays disaster zones with dynamic radius overlays
 * Shows impact areas and affected volunteer/task counts
 */

import { useState } from 'react';
import { MapContainer } from './MapContainer';
import { DisasterMarker } from './DisasterMarker';
import { MapLegend } from './MapLegend';
import { Disaster } from '../../types/disaster';

interface DisasterMapProps {
  disasters: Disaster[];
  loading?: boolean;
  onDisasterSelect?: (disaster: Disaster) => void;
  center?: [number, number];
  zoom?: number;
  statusFilter?: ('ACTIVE' | 'ONGOING' | 'RESOLVED')[];
  className?: string;
}

/**
 * Map view for disaster zones with dynamic radius
 * - Radius determined by severity (LOW:2km, MEDIUM:5km, HIGH:10km, CRITICAL:20km)
 * - Color-coded by severity
 * - Shows impact zone as dashed circle
 * - Click for disaster details
 */
export function DisasterMap({
  disasters,
  loading = false,
  onDisasterSelect,
  center = [20, 78],
  zoom = 6,
  statusFilter = ['ACTIVE', 'ONGOING'],
  className = '',
}: DisasterMapProps) {
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null);

  // Filter disasters by status
  const filteredDisasters =
    statusFilter.length === 0
      ? disasters
      : disasters.filter((d) => statusFilter.includes(d.status as any));

  const handleDisasterClick = (disaster: Disaster) => {
    setSelectedDisaster(disaster);
    onDisasterSelect?.(disaster);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <MapContainer center={center} zoom={zoom} loading={loading}>
        {filteredDisasters.map((disaster) => (
          <DisasterMarker
            key={disaster.id}
            disaster={disaster}
            selected={selectedDisaster?.id === disaster.id}
            onClick={handleDisasterClick}
            showRadius={true}
          />
        ))}
        <MapLegend
          showVolunteers={false}
          showTasks={false}
          showDisasters={true}
          showHeatmap={false}
          position="topleft"
        />
      </MapContainer>
    </div>
  );
}
