import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface OfflineIndicatorProps {
  message?: string;
  position?: 'top' | 'bottom';
}

/**
 * OfflineIndicator Component
 * Minimal floating indicator showing offline status
 * Appears when user loses internet connection
 */
export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  message = 'You are offline. Changes will be saved locally.',
  position = 'bottom',
}) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  const positionStyles = position === 'top'
    ? { top: '1rem' }
    : { bottom: '1rem' };

  return (
    <div style={{ ...styles.container, ...positionStyles }}>
      <div style={styles.content}>
        <AlertCircle size={20} style={styles.icon} />
        <span style={styles.text}>{message}</span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    left: '1rem',
    right: '1rem',
    maxWidth: '500px',
    marginLeft: 'auto',
    marginRight: 'auto',
    zIndex: 9999,
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    background: '#fed7aa',
    border: '1px solid #fdba74',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  icon: {
    color: '#b45309',
    flexShrink: 0,
  },
  text: {
    fontSize: '0.9rem',
    color: '#92400e',
    fontWeight: 500,
  },
};

export default OfflineIndicator;
