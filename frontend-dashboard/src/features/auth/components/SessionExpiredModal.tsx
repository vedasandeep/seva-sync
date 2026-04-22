import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onLogout: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ isOpen, onLogout }) => {
  const [countdown, setCountdown] = useState(30);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout();
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onLogout, navigate]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.iconWrapper}>
          <AlertCircle size={48} style={{ color: '#dc2626' }} />
        </div>

        <h2 style={styles.title}>Session Expired</h2>
        <p style={styles.message}>
          Your session has expired due to inactivity. For security reasons, you've been logged out.
        </p>

        <div style={styles.countdownWrapper}>
          <p style={styles.countdownText}>
            Redirecting to login in <strong>{countdown}s</strong>
          </p>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${(countdown / 30) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <button
          onClick={() => {
            onLogout();
            navigate('/login');
          }}
          style={styles.button}
        >
          Login Again
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: '2rem',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  iconWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  title: {
    margin: '0 0 0.75rem',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  message: {
    margin: '0 0 1.5rem',
    fontSize: '0.875rem',
    color: '#64748b',
    lineHeight: '1.5',
  },
  countdownWrapper: {
    marginBottom: '1.5rem',
    padding: '1rem',
    background: '#f1f5f9',
    borderRadius: '0.5rem',
  },
  countdownText: {
    margin: '0 0 0.75rem',
    fontSize: '0.875rem',
    color: '#334155',
  },
  progressBar: {
    width: '100%',
    height: '4px',
    background: '#e2e8f0',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#dc2626',
    transition: 'width 0.1s linear',
  },
  button: {
    width: '100%',
    padding: '0.875rem',
    background: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default SessionExpiredModal;
