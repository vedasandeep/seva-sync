import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export type AlertType = 'error' | 'warning' | 'success' | 'info';

interface AlertProps {
  type: AlertType;
  title: string;
  message: string;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Alert Component
 * Reusable alert component for displaying different types of messages
 * Supports error, warning, success, and info types
 */
export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onDismiss,
  action,
}) => {
  const config = typeConfig[type];

  return (
    <div style={{ ...styles.container, ...config.containerStyle }}>
      <div style={styles.content}>
        <div style={styles.iconWrapper}>
          {config.icon}
        </div>
        <div style={styles.textContent}>
          <h3 style={{ ...styles.title, ...config.textStyle }}>{title}</h3>
          <p style={{ ...styles.message, ...config.textStyle }}>{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={styles.dismissButton}
            aria-label="Dismiss alert"
          >
            ×
          </button>
        )}
      </div>
      {action && (
        <div style={styles.actionBar}>
          <button
            onClick={action.onClick}
            style={{ ...styles.actionButton, ...config.actionStyle }}
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
};

const typeConfig: Record<AlertType, any> = {
  error: {
    icon: <AlertCircle size={24} color="#dc2626" />,
    containerStyle: {
      background: '#fef2f2',
      borderColor: '#fecaca',
    },
    textStyle: {
      color: '#991b1b',
    },
    actionStyle: {
      background: '#dc2626',
    },
  },
  warning: {
    icon: <AlertTriangle size={24} color="#ca8a04" />,
    containerStyle: {
      background: '#fef3c7',
      borderColor: '#fde68a',
    },
    textStyle: {
      color: '#92400e',
    },
    actionStyle: {
      background: '#ca8a04',
    },
  },
  success: {
    icon: <CheckCircle size={24} color="#16a34a" />,
    containerStyle: {
      background: '#f0fdf4',
      borderColor: '#bbf7d0',
    },
    textStyle: {
      color: '#15803d',
    },
    actionStyle: {
      background: '#16a34a',
    },
  },
  info: {
    icon: <Info size={24} color="#1e40af" />,
    containerStyle: {
      background: '#eff6ff',
      borderColor: '#bfdbfe',
    },
    textStyle: {
      color: '#1e3a8a',
    },
    actionStyle: {
      background: '#1e40af',
    },
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    border: '1px solid',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
  },
  content: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1rem',
  },
  iconWrapper: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
  },
  title: {
    margin: '0 0 0.25rem 0',
    fontSize: '0.95rem',
    fontWeight: 600,
  },
  message: {
    margin: 0,
    fontSize: '0.85rem',
    lineHeight: '1.5',
  },
  dismissButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: 0,
    color: 'inherit',
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
  actionBar: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderTop: '1px solid',
    borderTopColor: 'inherit',
  },
  actionButton: {
    padding: '0.5rem 1rem',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
};

export default Alert;
