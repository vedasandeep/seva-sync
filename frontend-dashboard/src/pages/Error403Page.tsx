import React from 'react';
import { AlertCircle, Lock } from 'lucide-react';

/**
 * Error403Page Component
 * Displays a user-friendly 403 (Forbidden) error page
 * Used when user lacks permissions to access a resource
 */
export const Error403Page: React.FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.errorCode}>403</div>
        <Lock size={48} style={{ color: '#ca8a04', marginBottom: '1rem' }} />
        <h1 style={styles.title}>Access Denied</h1>
        <p style={styles.message}>
          You don't have permission to access this resource.
        </p>
        <p style={styles.submessage}>
          If you believe this is a mistake, please contact your administrator.
        </p>
        <a href="/" style={styles.button}>
          Go to Home
        </a>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
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
    color: '#fcd34d',
    lineHeight: '1',
    marginBottom: '1rem',
  },
  title: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#92400e',
  },
  message: {
    marginTop: '1rem',
    fontSize: '0.95rem',
    color: '#b45309',
    lineHeight: '1.6',
  },
  submessage: {
    marginTop: '0.5rem',
    fontSize: '0.85rem',
    color: '#92400e',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: '1.5rem',
    padding: '0.75rem 1.5rem',
    background: '#ca8a04',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};

export default Error403Page;
