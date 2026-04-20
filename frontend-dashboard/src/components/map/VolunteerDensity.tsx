/**
 * VolunteerDensity Component
 * 
 * Displays volunteer density heatmap using grid-based cells
 * Shows volunteer concentration and coverage gaps
 */

import { CircleMarker, Popup } from 'react-leaflet';
import { MapContainer } from './MapContainer';
import { MapLegend } from './MapLegend';
import { getDensityColor, getHeatmapIntensity } from '../../lib/geoUtils';

interface HeatmapCell {
  id: string;
  lat: number;
  lng: number;
  volunteerCount: number;
  taskCount: number;
  avgBurnout?: number;
  density: 'low' | 'medium' | 'high' | 'critical';
  skills?: string[];
}

interface VolunteerDensityProps {
  cells: HeatmapCell[];
  loading?: boolean;
  center?: [number, number];
  zoom?: number;
  gridSizeKm?: number;
  maxVolunteers?: number;
  className?: string;
}

/**
 * Grid-based volunteer density heatmap
 * - Each cell represents 1-2km grid square
 * - Color intensity based on volunteer density
 * - Popup shows volunteer count, skills, avg burnout
 */
export function VolunteerDensity({
  cells,
  loading = false,
  center = [20, 78],
  zoom = 8,
  maxVolunteers = 20,
  className = '',
}: VolunteerDensityProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <MapContainer center={center} zoom={zoom} loading={loading}>
        {cells.map((cell) => {
          const color = getDensityColor(cell.density);
          const intensity = getHeatmapIntensity(cell.volunteerCount, maxVolunteers);
          const radius = 500 + (cell.volunteerCount * 200); // Scale radius by count

          const popupContent = (
            <div className="text-sm">
              <div className="font-semibold">Cell {cell.id}</div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Volunteers:</span>
                  <span className="font-medium">{cell.volunteerCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Open Tasks:</span>
                  <span className="font-medium">{cell.taskCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Burnout:</span>
                  <span className="font-medium">{cell.avgBurnout?.toFixed(1) || 'N/A'}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Density:</span>
                  <span className="font-medium capitalize">{cell.density}</span>
                </div>
                {cell.skills && cell.skills.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {cell.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {cell.skills.length > 3 && (
                      <span className="text-gray-500 text-xs">+{cell.skills.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );

          return (
            <CircleMarker
              key={cell.id}
              center={[cell.lat, cell.lng]}
              radius={Math.max(6, Math.min(20, radius / 500))}
              pathOptions={{
                fillColor: color,
                color: color,
                weight: 2,
                opacity: 0.8,
                fillOpacity: intensity,
              }}
            >
              <Popup>{popupContent}</Popup>
            </CircleMarker>
          );
        })}
        <MapLegend
          showVolunteers={false}
          showTasks={false}
          showDisasters={false}
          showHeatmap={true}
          position="topleft"
        />
      </MapContainer>
    </div>
  );
}
