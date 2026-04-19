import React, { ReactNode } from 'react';
import { useOffline } from '../hooks/useOffline';
import { useUIStore } from '../stores/uiStore';
import { Badge } from './ui/Badge';
import { ToastContainer } from './ui/Toast';
import { Avatar } from './ui/Avatar';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  volunteerName?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, volunteerName = 'Volunteer' }) => {
  const { isOffline, pendingSyncCount } = useOffline();
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title || 'SevaSync'}</h1>
            <p className="text-blue-100 text-sm">{volunteerName}</p>
          </div>
          <div className="flex items-center gap-4">
            {isOffline && (
              <Badge variant="warning">
                Offline
              </Badge>
            )}
            {pendingSyncCount > 0 && (
              <Badge variant="info">
                {pendingSyncCount} pending
              </Badge>
            )}
            <Avatar name={volunteerName} size="md" />
          </div>
        </div>
      </header>

      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 flex items-center gap-2">
          <span className="text-yellow-700 font-medium">⚠️ You're offline</span>
          <p className="text-yellow-600 text-sm">
            {pendingSyncCount > 0
              ? `${pendingSyncCount} changes pending sync`
              : 'Your changes will sync when connected'}
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-4 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-gray-600 text-sm">
          <p>© 2024 SevaSync. Volunteer coordination platform.</p>
        </div>
      </footer>
    </div>
  );
};
