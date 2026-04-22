import React from 'react';
import { AlertCircle, Home } from 'lucide-react';

/**
 * Error404Page Component
 * Displays a user-friendly 404 (Not Found) error page
 */
export const Error404Page: React.FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.errorCode}>404</div>
        <AlertCircle size={48} style={{ color: '#64748b', marginBottom: '1rem' }} />
        <h1 style={styles.title}>Page Not Found</h1>
        <p style={styles.message}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/" style={styles.button}>
          <Home size={20} style={{ marginRight: '0.5rem' }} />
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
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
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
    color: '#cbd5e1',
    lineHeight: '1',
    marginBottom: '1rem',
  },
  title: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  message: {
    marginTop: '1rem',
    fontSize: '0.95rem',
    color: '#64748b',
    lineHeight: '1.6',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: '1.5rem',
    padding: '0.75rem 1.5rem',
    background: '#1e40af',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};

export default Error404Page;
