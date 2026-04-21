import { WidgetCard, DashboardSection } from '../components/dashboard';
import { TrendingUp, Users, Target, Globe, Zap, Award, BarChart3 } from 'lucide-react';
import { ImpactStoryCard } from '../features/analytics';

/**
 * Impact Analytics Page
 * Shows comprehensive disaster response impact metrics and volunteer stories
 */

interface ImpactMetric {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; direction: 'up' | 'down' };
}

interface ImpactStoryDisplay {
  id: string;
  title: string;
  description: string;
  impact: string;
  volunteers: number;
  hours: number;
  people: number;
  disaster: string;
  date: string;
}

const KPI_CARDS: ImpactMetric[] = [
  {
    label: 'People Helped',
    value: 12000,
    unit: 'individuals',
    icon: <Users size={24} />,
    color: 'blue',
    trend: { value: 8, direction: 'up' },
  },
  {
    label: 'Volunteer Hours',
    value: 2840,
    unit: 'hours contributed',
    icon: <Zap size={24} />,
    color: 'green',
    trend: { value: 15, direction: 'up' },
  },
  {
    label: 'Tasks Completed',
    value: 456,
    unit: 'out of 500',
    icon: <Target size={24} />,
    color: 'purple',
    trend: { value: 91, direction: 'up' },
  },
  {
    label: 'Active Volunteers',
    value: 142,
    unit: 'disaster response',
    icon: <Users size={24} />,
    color: 'amber',
    trend: { value: 35, direction: 'up' },
  },
  {
    label: 'IVR Adoption',
    value: '35%',
    unit: 'of volunteers',
    icon: <BarChart3 size={24} />,
    color: 'indigo',
    trend: { value: 12, direction: 'up' },
  },
  {
    label: 'Disaster Coverage',
    value: 3,
    unit: 'active disasters',
    icon: <Globe size={24} />,
    color: 'red',
    trend: { value: 2, direction: 'down' },
  },
  {
    label: 'Avg Response Time',
    value: '12',
    unit: 'minutes',
    icon: <Award size={24} />,
    color: 'pink',
    trend: { value: 3, direction: 'down' },
  },
  {
    label: 'Success Rate',
    value: '91%',
    unit: 'task completion',
    icon: <TrendingUp size={24} />,
    color: 'teal',
    trend: { value: 5, direction: 'up' },
  },
];

const IMPACT_STORIES: ImpactStoryDisplay[] = [
  {
    id: 'story-001',
    title: 'Hyderabad Flood Relief - Medical Aid Distribution',
    description: 'Coordinated medical supply distribution across 15 affected communities using IVR system',
    impact: '2,500 people received emergency medical supplies',
    volunteers: 45,
    hours: 340,
    people: 2500,
    disaster: 'Hyderabad Floods',
    date: '2026-04-15',
  },
  {
    id: 'story-002',
    title: 'Chennai Water Crisis - Supply Chain Coordination',
    description: 'Organized efficient water distribution network using volunteer scheduling',
    impact: '5,000 people received clean drinking water',
    volunteers: 38,
    hours: 420,
    people: 5000,
    disaster: 'Chennai Water Crisis',
    date: '2026-04-10',
  },
  {
    id: 'story-003',
    title: 'Kerala Landslide - Emergency Evacuation',
    description: 'Mobilized volunteer teams for emergency evacuation and safe relocation',
    impact: '1,200 people evacuated to safety',
    volunteers: 72,
    hours: 580,
    people: 1200,
    disaster: 'Kerala Landslides',
    date: '2026-04-05',
  },
  {
    id: 'story-004',
    title: 'Multi-Disaster Coordination - Volunteer Wellbeing',
    description: 'Implemented wellness check-ins reducing volunteer burnout by 23%',
    impact: 'Sustained volunteer engagement across 3 disasters',
    volunteers: 142,
    hours: 500,
    people: 3300,
    disaster: 'Multi-Disaster',
    date: '2026-04-20',
  },
];

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; icon: string; text: string }> = {
    blue: { bg: 'bg-blue-50 border-blue-200', icon: 'bg-blue-100 text-blue-600', text: 'text-blue-900' },
    green: { bg: 'bg-green-50 border-green-200', icon: 'bg-green-100 text-green-600', text: 'text-green-900' },
    purple: { bg: 'bg-purple-50 border-purple-200', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-900' },
    amber: { bg: 'bg-amber-50 border-amber-200', icon: 'bg-amber-100 text-amber-600', text: 'text-amber-900' },
    indigo: { bg: 'bg-indigo-50 border-indigo-200', icon: 'bg-indigo-100 text-indigo-600', text: 'text-indigo-900' },
    red: { bg: 'bg-red-50 border-red-200', icon: 'bg-red-100 text-red-600', text: 'text-red-900' },
    pink: { bg: 'bg-pink-50 border-pink-200', icon: 'bg-pink-100 text-pink-600', text: 'text-pink-900' },
    teal: { bg: 'bg-teal-50 border-teal-200', icon: 'bg-teal-100 text-teal-600', text: 'text-teal-900' },
  };
  return colors[color] || colors.blue;
};

export default function ImpactAnalyticsPage() {
  return (
    <DashboardSection>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Impact Analytics</h1>
        <p className="text-gray-600 mt-2">
          Disaster response impact metrics and volunteer contribution stories
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {KPI_CARDS.map((kpi, index) => {
          const colors = getColorClasses(kpi.color);
          return (
            <WidgetCard key={index} className={`border ${colors.bg}`}>
              <div className="p-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors.icon}`}>
                  {kpi.icon}
                </div>

                {/* Label */}
                <p className="text-xs font-medium text-gray-600 mb-2">{kpi.label}</p>

                {/* Value */}
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  {kpi.unit && <p className="text-xs text-gray-500">{kpi.unit}</p>}
                </div>

                {/* Trend */}
                {kpi.trend && (
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    kpi.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span>{kpi.trend.direction === 'up' ? '↑' : '↓'}</span>
                    <span>{kpi.trend.value}% from last week</span>
                  </div>
                )}
              </div>
            </WidgetCard>
          );
        })}
      </div>

      {/* Impact Stories Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Impact Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {IMPACT_STORIES.map((story) => (
            <ImpactStoryCard
              key={story.id}
              story={{
                id: story.id,
                title: story.title,
                description: story.description,
                peopleHelped: story.people,
                volunteerHours: story.hours,
                tasksCompleted: story.volunteers,
                location: story.disaster,
                date: new Date(story.date).toLocaleDateString(),
                color: 'blue',
              }}
              variant="detailed"
            />
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <WidgetCard className="mt-8">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-gray-900">Overall Impact Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
          <div>
            <p className="text-sm text-gray-600">Total People Impacted</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">12,000+</p>
            <p className="text-xs text-gray-500 mt-1">Across 3 disasters</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Volunteer Contributions</p>
            <p className="text-3xl font-bold text-green-600 mt-2">2,840</p>
            <p className="text-xs text-gray-500 mt-1">Total hours served</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Hours per Volunteer</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">20</p>
            <p className="text-xs text-gray-500 mt-1">Commitment level</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cost per Person Helped</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">₹237</p>
            <p className="text-xs text-gray-500 mt-1">Resource efficiency</p>
          </div>
        </div>
      </WidgetCard>
    </DashboardSection>
  );
}
