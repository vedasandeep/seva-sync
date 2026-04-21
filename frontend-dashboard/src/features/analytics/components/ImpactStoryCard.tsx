import React from 'react';
import { Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export interface ImpactStory {
  id: string;
  title: string;
  description: string;
  peopleHelped: number;
  volunteerHours: number;
  tasksCompleted: number;
  location: string;
  date: string;
  icon?: 'users' | 'clock' | 'check' | 'alert';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

interface ImpactStoryCardProps {
  story: ImpactStory;
  variant?: 'default' | 'compact' | 'detailed';
}

const colorVariants = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
};

const iconMap = {
  users: Users,
  clock: Clock,
  check: CheckCircle2,
  alert: AlertCircle,
};

export const ImpactStoryCard: React.FC<ImpactStoryCardProps> = ({
  story,
  variant = 'default',
}) => {
  const color = story.color || 'blue';
  const colorStyle = colorVariants[color];
  const IconComponent = iconMap[story.icon || 'users'];

  if (variant === 'compact') {
    return (
      <div
        className={`${colorStyle.bg} border ${colorStyle.border} rounded-lg p-4 hover:shadow-md transition-shadow`}
      >
        <div className="flex items-start gap-3">
          <IconComponent className={`${colorStyle.text} flex-shrink-0 mt-1`} size={20} />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{story.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{story.location}</p>
            <div className="flex gap-3 mt-2 text-xs">
              <span className="font-medium text-gray-700">{story.peopleHelped} people</span>
              <span className="font-medium text-gray-700">{story.volunteerHours}h</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div
        className={`${colorStyle.bg} border ${colorStyle.border} rounded-lg p-6 hover:shadow-lg transition-shadow`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`${colorStyle.text} bg-white p-3 rounded-lg flex-shrink-0`}
          >
            <IconComponent size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{story.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{story.location}</p>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded">
                {story.date}
              </span>
            </div>
            <p className="text-gray-700 mt-3 text-sm leading-relaxed">
              {story.description}
            </p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white rounded p-3 text-center">
                <div className="text-xl font-bold text-gray-900">{story.peopleHelped}</div>
                <div className="text-xs text-gray-600 mt-1">People Helped</div>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <div className="text-xl font-bold text-gray-900">{story.volunteerHours}h</div>
                <div className="text-xs text-gray-600 mt-1">Volunteer Hours</div>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <div className="text-xl font-bold text-gray-900">{story.tasksCompleted}</div>
                <div className="text-xs text-gray-600 mt-1">Tasks</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`${colorStyle.bg} border ${colorStyle.border} rounded-lg p-5 hover:shadow-md transition-shadow`}
    >
      <div className="flex gap-4">
        <div className={`${colorStyle.text} flex-shrink-0`}>
          <IconComponent size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900">{story.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{story.description}</p>
          <p className="text-xs text-gray-500 mt-2">{story.location}</p>
          <div className="flex gap-4 mt-3 text-sm font-medium text-gray-700">
            <span>👥 {story.peopleHelped} people</span>
            <span>⏱️ {story.volunteerHours}h</span>
            <span>✓ {story.tasksCompleted} tasks</span>
          </div>
        </div>
        <span className="text-xs text-gray-500 flex-shrink-0">{story.date}</span>
      </div>
    </div>
  );
};

export default ImpactStoryCard;
