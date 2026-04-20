import {
  getSeverityColor,
  getUrgencyColor,
  getBurnoutColor,
  getDensityColor,
} from '../../lib/geoUtils';

interface MapLegendProps {
  showVolunteers?: boolean;
  showTasks?: boolean;
  showDisasters?: boolean;
  showHeatmap?: boolean;
  position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  className?: string;
}

/**
 * Legend component for map markers and colors
 * Displays color meanings for volunteers (burnout), tasks (urgency), disasters (severity), heatmaps (density)
 */
export function MapLegend({
  showVolunteers = true,
  showTasks = true,
  showDisasters = true,
  showHeatmap = false,
  position = 'topleft',
  className = '',
}: MapLegendProps) {
  const positionClasses = {
    topleft: 'top-4 left-4',
    topright: 'top-4 right-4',
    bottomleft: 'bottom-4 left-4',
    bottomright: 'bottom-4 right-4',
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} bg-white rounded-lg shadow-lg p-4 text-sm max-w-xs ${className}`}
      style={{
        zIndex: 400,
        backdropFilter: 'blur(2px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
      }}
    >
      {showVolunteers && (
        <div className="mb-4">
          <div className="font-semibold text-gray-800 mb-2">Volunteers</div>
          <div className="space-y-1.5">
            {[
              { score: 20, label: 'Critical Burnout' },
              { score: 50, label: 'High Burnout' },
              { score: 75, label: 'Medium Burnout' },
              { score: 95, label: 'Available' },
            ].map(({ score, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: getBurnoutColor(score),
                    border: '1px solid #ccc',
                  }}
                />
                <span className="text-gray-700">{label}</span>
              </div>
            ))}
            <div className="text-xs text-gray-500 mt-2">Circle = Availability radius</div>
          </div>
        </div>
      )}

      {showTasks && (
        <div className="mb-4">
          <div className="font-semibold text-gray-800 mb-2">Tasks</div>
          <div className="space-y-1.5">
            {[
              { urgency: 'LOW', label: 'Low Urgency' },
              { urgency: 'MEDIUM', label: 'Medium Urgency' },
              { urgency: 'HIGH', label: 'High Urgency' },
              { urgency: 'CRITICAL', label: 'Critical' },
            ].map(({ urgency, label }) => (
              <div key={urgency} className="flex items-center gap-2">
                <div
                  style={{
                    width: '14px',
                    height: '20px',
                    backgroundColor: getUrgencyColor(urgency as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'),
                    borderRadius: '50% 50% 50% 0',
                    transform: 'rotate(-45deg)',
                    border: '1px solid #fff',
                  }}
                />
                <span className="text-gray-700">{label}</span>
              </div>
            ))}
            <div className="text-xs text-gray-500 mt-2">
              ◉ Open | ◐ In Progress | ✓ Completed
            </div>
          </div>
        </div>
      )}

      {showDisasters && (
        <div className="mb-4">
          <div className="font-semibold text-gray-800 mb-2">Disasters</div>
          <div className="space-y-1.5">
            {[
              { severity: 'LOW', label: 'Low (2 km)' },
              { severity: 'MEDIUM', label: 'Medium (5 km)' },
              { severity: 'HIGH', label: 'High (10 km)' },
              { severity: 'CRITICAL', label: 'Critical (20 km)' },
            ].map(({ severity, label }) => (
              <div key={severity} className="flex items-center gap-2">
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: getSeverityColor(severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'),
                    border: '1px solid #ccc',
                  }}
                />
                <span className="text-gray-700">{label}</span>
              </div>
            ))}
            <div className="text-xs text-gray-500 mt-2">Circle = Impact zone</div>
          </div>
        </div>
      )}

      {showHeatmap && (
        <div>
          <div className="font-semibold text-gray-800 mb-2">Density</div>
          <div className="space-y-1.5">
            {[
              { density: 'low', label: 'Low' },
              { density: 'medium', label: 'Medium' },
              { density: 'high', label: 'High' },
              { density: 'critical', label: 'Critical' },
            ].map(({ density, label }) => (
              <div key={density} className="flex items-center gap-2">
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: getDensityColor(density as 'low' | 'medium' | 'high' | 'critical'),
                    border: '1px solid #ccc',
                  }}
                />
                <span className="text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
