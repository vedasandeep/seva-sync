import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.iconWrapper}>
          <Lock size={64} style={{ color: '#dc2626' }} />
        </div>

        <h1 style={styles.title}>Access Denied</h1>
        <p style={styles.description}>
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>

        <div style={styles.buttonGroup}>
          <button onClick={() => navigate('/dashboard')} style={styles.primaryButton}>
            Go to Dashboard
          </button>
          <button onClick={() => navigate(-1)} style={styles.secondaryButton}>
            Go Back
          </button>
        </div>

        <p style={styles.footerText}>
          Need help? <a href="mailto:support@sevasync.com" style={styles.link}>Contact support</a>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    padding: '1rem',
  },
  content: {
    textAlign: 'center',
    color: 'white',
  },
  iconWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  title: {
    margin: 0,
    fontSize: '3rem',
    fontWeight: 700,
    marginBottom: '1rem',
  },
  description: {
    margin: '0 0 2rem',
    fontSize: '1.125rem',
    color: '#cbd5e1',
    maxWidth: '500px',
    lineHeight: '1.6',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  primaryButton: {
    padding: '0.875rem 2rem',
    background: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '0.875rem 2rem',
    background: 'transparent',
    color: 'white',
    border: '2px solid white',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  footerText: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#94a3b8',
  },
  link: {
    color: '#60a5fa',
    textDecoration: 'none',
    fontWeight: 600,
  },
};
