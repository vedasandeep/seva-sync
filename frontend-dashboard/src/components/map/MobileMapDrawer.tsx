/**
 * MobileMapDrawer Component
 * 
 * Full-screen map overlay for mobile devices
 * Shows expanded map with bottom sheet for details
 */

import { ReactNode } from 'react';
import { X, ChevronUp } from 'lucide-react';

interface MobileMapDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  detailsPanel?: ReactNode;
  detailsOpen?: boolean;
  onDetailsToggle?: (open: boolean) => void;
}

/**
 * Mobile-friendly full-screen map drawer
 * - Slides up from bottom on mobile
 * - Shows expanded map with details panel
 * - Click outside to close
 */
export function MobileMapDrawer({
  isOpen,
  onClose,
  title = 'Map View',
  children,
  detailsPanel,
  detailsOpen = false,
  onDetailsToggle,
}: MobileMapDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose}>
      {/* Map container */}
      <div
        className="fixed inset-0 top-12 bg-white flex flex-col z-50 lg:hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 overflow-hidden">{children}</div>

        {/* Details panel */}
        {detailsPanel && (
          <div
            className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg transition-all duration-300 z-50 ${
              detailsOpen ? 'max-h-96' : 'max-h-16'
            }`}
          >
            {/* Handle bar */}
            <button
              onClick={() => onDetailsToggle?.(!detailsOpen)}
              className="w-full flex items-center justify-center py-2 hover:bg-gray-50"
            >
              <ChevronUp
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  detailsOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Content */}
            {detailsOpen && (
              <div className="overflow-y-auto max-h-80 px-4 pb-4">{detailsPanel}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
