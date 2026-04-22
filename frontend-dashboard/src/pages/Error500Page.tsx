import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Error500PageProps {
  onRetry?: () => void;
}

/**
 * Error500Page Component
 * Displays a user-friendly 500 (Server Error) error page
 * Includes retry functionality and helpful error reporting information
 */
export const Error500Page: React.FC<Error500PageProps> = ({ onRetry }) => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.errorCode}>500</div>
        <AlertCircle size={48} style={{ color: '#dc2626', marginBottom: '1rem' }} />
        <h1 style={styles.title}>Server Error</h1>
        <p style={styles.message}>
          Something went wrong on our end. Our team has been notified and is working to fix it.
        </p>
        <p style={styles.submessage}>
          Error ID: {generateErrorId()}
        </p>
        <div style={styles.buttonGroup}>
          {onRetry ? (
            <button onClick={onRetry} style={styles.primaryButton}>
              <RefreshCw size={20} style={{ marginRight: '0.5rem' }} />
              Try Again
            </button>
          ) : null}
          <a href="/" style={styles.secondaryButton}>
            Go to Home
          </a>
        </div>
        <p style={styles.helpText}>
          If this problem persists, please contact support with the error ID above.
        </p>
      </div>
    </div>
  );
};

function generateErrorId(): string {
  return `ERR-${Date.now().toString(36).toUpperCase()}`;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '2rem',
    maxWidth: '500px',
  },
  errorCode: {
    fontSize: '6rem',
    fontWeight: 700,
    color: '#fca5a5',
    lineHeight: '1',
    marginBottom: '1rem',
  },
  title: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#991b1b',
  },
  message: {
    marginTop: '1rem',
    fontSize: '0.95rem',
    color: '#7f1d1d',
    lineHeight: '1.6',
  },
  submessage: {
    marginTop: '0.5rem',
    fontSize: '0.85rem',
    color: '#991b1b',
    fontFamily: 'monospace',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  secondaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    color: '#dc2626',
    border: '2px solid #dc2626',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  helpText: {
    marginTop: '2rem',
    fontSize: '0.85rem',
    color: '#7f1d1d',
  },
};

export default Error500Page;
