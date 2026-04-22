import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
}

/**
 * LoadingSpinner Component
 * Displays a loading indicator with optional message
 * Can be full-screen or inline
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  fullScreen = false,
}) => {
  const sizeConfig = {
    small: { dimension: 32, strokeWidth: 3 },
    medium: { dimension: 48, strokeWidth: 4 },
    large: { dimension: 64, strokeWidth: 5 },
  };

  const config = sizeConfig[size];

  const containerStyle = fullScreen
    ? styles.fullScreenContainer
    : styles.inlineContainer;

  return (
    <div style={containerStyle}>
      <svg
        width={config.dimension}
        height={config.dimension}
        viewBox="0 0 50 50"
        style={styles.spinner}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={config.strokeWidth}
        />
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="#1e40af"
          strokeWidth={config.strokeWidth}
          strokeDasharray="31.4 125.6"
          strokeDashoffset="0"
          strokeLinecap="round"
          style={{
            animation: 'spin 1s linear infinite',
          }}
        />
      </svg>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  fullScreenContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.9)',
    zIndex: 9999,
  },
  inlineContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  message: {
    marginTop: '1rem',
    fontSize: '0.95rem',
    color: '#475569',
    fontWeight: 500,
  },
};

// Add CSS animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `;
  document.head.appendChild(style);
}

export default LoadingSpinner;
