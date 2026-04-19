import { Bell, Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface TopHeaderProps {
  onMenuClick?: () => void;
}

export default function TopHeader({ onMenuClick }: TopHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Sample notifications
  const notifications = [
    { id: 1, type: 'alert', message: 'Burnout alert: 3 volunteers at critical level', time: '5 min ago' },
    { id: 2, type: 'info', message: 'New disaster reported: Flood in Mumbai', time: '12 min ago' },
    { id: 3, type: 'success', message: 'Task completed: Medical supplies distributed', time: '1 hour ago' },
    { id: 4, type: 'warning', message: 'Sync failure: 3 IVR calls pending retry', time: '2 hours ago' },
    { id: 5, type: 'info', message: 'Volunteer check-in: 15 new volunteers joined', time: '3 hours ago' },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Left: Menu button (mobile) + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-slate-600" />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-slate-900">SevaSync</h1>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden md:block flex-1 max-w-md mx-8">
          <input
            type="text"
            placeholder="Search disasters, volunteers, tasks..."
            className="w-full px-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors last:border-b-0"
                    >
                      <div className="flex gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            notif.type === 'alert'
                              ? 'bg-red-500'
                              : notif.type === 'warning'
                              ? 'bg-yellow-500'
                              : notif.type === 'success'
                              ? 'bg-green-500'
                              : 'bg-blue-500'
                          }`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-900">{notif.message}</p>
                          <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:inline text-sm text-slate-900 font-medium">{user?.name}</span>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                <div className="p-3 border-b border-slate-200">
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.role}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    // Navigate to profile
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                >
                  <User size={16} />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
