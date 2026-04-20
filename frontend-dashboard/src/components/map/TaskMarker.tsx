import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Task } from '../../types/task';
import { getUrgencyColor } from '../../lib/geoUtils';

interface TaskMarkerProps {
  task: Task;
  selected?: boolean;
  onClick?: (task: Task) => void;
  showDistance?: boolean;
  volunteerLocation?: { lat: number; lng: number };
}

/**
 * Marker component for displaying task on map
 * Icon changes based on status: OPEN (filled), IN_PROGRESS (half-filled), COMPLETED (grayed out)
 * Color-coded by urgency: Blue (low) -> Amber (medium) -> Orange (high) -> Red (critical)
 */
export function TaskMarker({
  task,
  selected = false,
  onClick,
  showDistance = false,
  volunteerLocation,
}: TaskMarkerProps) {
  const urgencyColor = getUrgencyColor(task.urgency);

  // Create custom icon - pin shape for tasks
  const icon = L.divIcon({
    html: `
      <div style="
        width: 28px;
        height: 40px;
        background-color: ${urgencyColor};
        border: ${selected ? '3px' : '2px'} solid ${selected ? '#000' : '#fff'};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <div style="
          transform: rotate(45deg);
          font-weight: bold;
          color: white;
          font-size: 12px;
        ">
          ${task.status === 'COMPLETED' ? '✓' : task.status === 'IN_PROGRESS' ? '◐' : '◉'}
        </div>
      </div>
    `,
    className: 'task-marker',
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -40],
  });

  const popupContent = (
    <div className="text-sm max-w-xs">
      <div className="font-semibold">{task.title}</div>
      <div className="text-gray-600 text-xs mt-1">{task.description}</div>
      <div className="mt-2 space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Status:</span>
          <span className="font-medium">{task.status}</span>
        </div>
        <div className="flex justify-between">
          <span>Urgency:</span>
          <span className="font-medium">{task.urgency}</span>
        </div>
        {task.requiredSkills && task.requiredSkills.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {task.requiredSkills.map((skill: string) => (
              <span
                key={skill}
                className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
        {showDistance && volunteerLocation && (
          <div className="border-t pt-1 mt-1 text-gray-500">
            {/* Distance calculation would go here */}
            Distance: TBD
          </div>
        )}
      </div>
    </div>
  );

  const lat = Number(task.latitude);
  const lng = Number(task.longitude);

  return (
    <Marker
      position={[lat, lng]}
      icon={icon}
      eventHandlers={{
        click: () => onClick?.(task),
      }}
    >
      <Popup>{popupContent}</Popup>
    </Marker>
  );
}
