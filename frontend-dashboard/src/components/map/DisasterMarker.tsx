import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Disaster } from '../../types/disaster';
import { getSeverityColor, getDisasterRadius } from '../../lib/geoUtils';

interface DisasterMarkerProps {
  disaster: Disaster;
  selected?: boolean;
  onClick?: (disaster: Disaster) => void;
  showRadius?: boolean;
}

/**
 * Marker component for displaying disaster zone on map
 * Circle marker sized by disaster radius (dynamic based on severity)
 * Color-coded by severity: Blue (low) -> Amber (medium) -> Orange (high) -> Red (critical)
 * Shows impact radius as circle overlay
 */
export function DisasterMarker({
  disaster,
  selected = false,
  onClick,
  showRadius = true,
}: DisasterMarkerProps) {
  const severityColor = getSeverityColor(disaster.severity);
  const radiusKm = getDisasterRadius(disaster.severity);

  // Create custom icon - larger circle for disasters
  const icon = L.divIcon({
    html: `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: ${severityColor};
        border: ${selected ? '3px' : '2px'} solid ${selected ? '#000' : '#fff'};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 3px rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 18px;
        cursor: pointer;
      ">
        ⚠
      </div>
    `,
    className: 'disaster-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });

  const statusConfig: Record<string, { bgColor: string; textColor: string }> = {
    ACTIVE: { bgColor: 'bg-red-100', textColor: 'text-red-800' },
    ONGOING: { bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
    RESOLVED: { bgColor: 'bg-green-100', textColor: 'text-green-800' },
  };

  const statusStyle = statusConfig[disaster.status] || { bgColor: 'bg-gray-100', textColor: 'text-gray-800' };

  const popupContent = (
    <div className="text-sm max-w-xs">
      <div className="font-semibold">{disaster.name}</div>
      <div className="text-gray-600 text-xs mt-1">{disaster.description}</div>
      <div className="mt-2 space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Status:</span>
          <span className={`font-medium px-2 py-1 rounded ${statusStyle.bgColor} ${statusStyle.textColor}`}>
            {disaster.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Severity:</span>
          <span className="font-medium">{disaster.severity}</span>
        </div>
        <div className="flex justify-between">
          <span>Impact Radius:</span>
          <span className="font-medium">{radiusKm} km</span>
        </div>
        {disaster.affectedPopulation && (
          <div className="flex justify-between">
            <span>Affected:</span>
            <span className="font-medium">{disaster.affectedPopulation.toLocaleString()}</span>
          </div>
        )}
        <div className="text-gray-500 text-xs mt-1">
          {Number(disaster.latitude).toFixed(4)}, {Number(disaster.longitude).toFixed(4)}
        </div>
      </div>
    </div>
  );

  const lat = Number(disaster.latitude);
  const lng = Number(disaster.longitude);

  return (
    <>
      <Marker
        position={[lat, lng]}
        icon={icon}
        eventHandlers={{
          click: () => onClick?.(disaster),
        }}
      >
        <Popup>{popupContent}</Popup>
      </Marker>
      {showRadius && (
        <Circle
          center={[lat, lng]}
          radius={radiusKm * 1000}
          pathOptions={{
            color: severityColor,
            fillColor: severityColor,
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '5, 5',
          }}
        />
      )}
    </>
  );
}
