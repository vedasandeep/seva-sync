/**
 * ScoreBreakdown Component
 * 
 * Displays detailed matching score breakdown with star ratings
 * Shows percentage + star rating as per user requirement
 */

import { getStarDisplay, getStarBreakdown } from '../../../lib/geoUtils';

interface ScoreComponent {
  label: string;
  score: number;
  weight: number;
}

interface ScoreBreakdownProps {
  volunteerName: string;
  finalScore: number;
  components: ScoreComponent[];
  className?: string;
}

/**
 * Displays matching score with visual star rating
 * Format: 87% with ★★★★☆ below
 * Shows component breakdown (skill, distance, availability, etc.)
 */
export function ScoreBreakdown({
  volunteerName,
  finalScore,
  components,
  className = '',
}: ScoreBreakdownProps) {
  const starDisplay = getStarDisplay(finalScore);
  const starBreakdown = getStarBreakdown(finalScore);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Volunteer Name */}
      <h3 className="font-semibold text-gray-900 mb-3">{volunteerName}</h3>

      {/* Final Score with Stars */}
      <div className="text-center mb-4 pb-4 border-b border-gray-200">
        <div className="text-3xl font-bold text-blue-600">{finalScore}%</div>
        <div className="text-xl text-yellow-500 mt-1">{starDisplay}</div>
        <div className="text-xs text-gray-500 mt-1">
          {starBreakdown.full} stars {starBreakdown.half && '½'} {starBreakdown.empty > 0 && `+ ${starBreakdown.empty} gaps`}
        </div>
      </div>

      {/* Component Breakdown */}
      <div className="space-y-3">
        {components.map((component) => (
          <div key={component.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">
                {component.label}
                {component.weight > 0 && (
                  <span className="text-gray-500 ml-1">({component.weight}%)</span>
                )}
              </span>
              <span className="font-semibold text-gray-900">{component.score}%</span>
            </div>
            {/* Score bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  component.score >= 75
                    ? 'bg-green-500'
                    : component.score >= 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${component.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Interpretation */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          {finalScore >= 80 && (
            <p>✓ Excellent match. This volunteer is highly suitable for this task.</p>
          )}
          {finalScore >= 60 && finalScore < 80 && (
            <p>○ Good match. This volunteer is suitable with considerations.</p>
          )}
          {finalScore >= 40 && finalScore < 60 && (
            <p>△ Fair match. Consider other options or provide support.</p>
          )}
          {finalScore < 40 && (
            <p>✗ Poor match. Recommended to find other volunteers.</p>
          )}
        </div>
      </div>
    </div>
  );
}
