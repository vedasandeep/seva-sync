import React, { ReactNode, useEffect, useState } from 'react';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

interface NetworkErrorBoundaryProps {
  children: ReactNode;
}

/**
 * NetworkErrorBoundary Component
 * Detects network connectivity issues and displays appropriate error UI
 * Monitors online/offline status and API connectivity
 */
export const NetworkErrorBoundary: React.FC<NetworkErrorBoundaryProps> = ({
  children,
}) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isApiAvailable, setIsApiAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setError(null);
      // Attempt to reconnect to API
      checkApiHealth();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setError('No internet connection detected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check API health on mount
    checkApiHealth();

    // Poll API health every 30 seconds
    const healthCheckInterval = setInterval(checkApiHealth, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(healthCheckInterval);
    };
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch('/health', { method: 'HEAD' });
      setIsApiAvailable(response.ok);
      if (!response.ok && isOnline) {
        setError('API server is unavailable. Please try again later.');
      }
    } catch (_err) {
      setIsApiAvailable(false);
      if (isOnline) {
        setError('Unable to connect to server. Please check your connection.');
      }
    }
  };

  if (!isOnline) {
    return (
      <div style={styles.offlineContainer}>
        <div style={styles.offlineContent}>
          <WifiOff size={48} style={{ color: '#dc2626', marginBottom: '1rem' }} />
          <h2 style={styles.title}>You are offline</h2>
          <p style={styles.message}>
            No internet connection detected. Some features may not work properly.
          </p>
          <p style={styles.submessage}>
            Your work will be saved locally and synced when you reconnect.
          </p>
          <button
            onClick={() => checkApiHealth()}
            style={styles.retryButton}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!isApiAvailable) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorContent}>
          <AlertTriangle size={48} style={{ color: '#dc2626', marginBottom: '1rem' }} />
          <h2 style={styles.title}>Server Error</h2>
          <p style={styles.message}>
            {error || 'The server is temporarily unavailable.'}
          </p>
          <p style={styles.submessage}>
            Please try again in a few moments.
          </p>
          <button
            onClick={() => checkApiHealth()}
            style={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const styles: Record<string, React.CSSProperties> = {
  offlineContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#fff7ed',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#fef2f2',
  },
  offlineContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '2rem',
    maxWidth: '500px',
  },
  errorContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '2rem',
    maxWidth: '500px',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  message: {
    marginTop: '1rem',
    fontSize: '0.95rem',
    color: '#475569',
  },
  submessage: {
    marginTop: '0.5rem',
    fontSize: '0.85rem',
    color: '#64748b',
  },
  retryButton: {
    marginTop: '1.5rem',
    padding: '0.75rem 2rem',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default NetworkErrorBoundary;
