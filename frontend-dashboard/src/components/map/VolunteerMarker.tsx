import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Volunteer } from '../../types/volunteer';
import { getBurnoutColor, scoreToStars } from '../../lib/geoUtils';

interface VolunteerMarkerProps {
  volunteer: Volunteer;
  selected?: boolean;
  onClick?: (volunteer: Volunteer) => void;
  showRadius?: boolean;
}

/**
 * Marker component for displaying individual volunteer on map
 * Color-coded by burnout score: Green (low) -> Yellow (medium) -> Orange (high) -> Red (critical)
 * Shows availability radius as circle overlay when showRadius=true
 */
export function VolunteerMarker({
  volunteer,
  selected = false,
  onClick,
  showRadius = false,
}: VolunteerMarkerProps) {
  const burnoutColor = getBurnoutColor(volunteer.burnoutScore);
  const starsDisplay = volunteer.matchScore !== undefined ? scoreToStars(volunteer.matchScore) : '';

  // Create custom icon with color-coded circle
  const icon = L.divIcon({
    html: `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: ${burnoutColor};
        border: ${selected ? '3px' : '2px'} solid ${selected ? '#000' : '#fff'};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 12px;
        cursor: pointer;
      ">
      </div>
    `,
    className: 'volunteer-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

  const popupContent = (
    <div className="text-sm">
      <div className="font-semibold">{volunteer.name}</div>
      <div className="text-gray-600">{volunteer.email}</div>
      <div className="mt-2 space-y-1 text-xs">
        <div>Burnout: {volunteer.burnoutScore}%</div>
        {volunteer.matchScore !== undefined && (
          <>
            <div>Match Score: {volunteer.matchScore}%</div>
            <div>Rating: {starsDisplay}</div>
          </>
        )}
        {volunteer.currentLat && volunteer.currentLng && (
          <div className="text-gray-500">
            {Number(volunteer.currentLat).toFixed(4)}, {Number(volunteer.currentLng).toFixed(4)}
          </div>
        )}
      </div>
    </div>
  );

  const lat = Number(volunteer.currentLat);
  const lng = Number(volunteer.currentLng);

  return (
    <>
      <Marker
        position={[lat, lng]}
        icon={icon}
        eventHandlers={{
          click: () => onClick?.(volunteer),
        }}
      >
        <Popup>{popupContent}</Popup>
      </Marker>
      {showRadius && volunteer.availabilityRadiusKm && (
        <Circle
          center={[lat, lng]}
          radius={volunteer.availabilityRadiusKm * 1000}
          pathOptions={{
            color: burnoutColor,
            fillColor: burnoutColor,
            fillOpacity: 0.1,
            weight: 1,
            dashArray: '5, 5',
          }}
        />
      )}
    </>
  );
}
