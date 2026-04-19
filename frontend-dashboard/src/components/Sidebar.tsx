import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  CheckSquare,
  Users,
  Settings,
  HelpCircle,
  FileText,
  BarChart3,
  Zap,
} from 'lucide-react';
import { useAuth } from '../lib/auth';

const navigationItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/disasters', label: 'Disasters', icon: AlertTriangle },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/volunteers', label: 'Volunteers', icon: Users },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

const secondaryItems = [
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/docs', label: 'Documentation', icon: FileText },
  { path: '/help', label: 'Help', icon: HelpCircle },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800 fixed left-0 top-0 h-screen">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold">SevaSync</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-slate-800"></div>

        {/* Secondary Items */}
        <div className="space-y-2">
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="border-t border-slate-800 px-4 py-4">
        <div className="p-4 bg-slate-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
