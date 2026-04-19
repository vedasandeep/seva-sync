import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose?: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles: Record<string, { bg: string; text: string; icon: string }> = {
    success: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' },
    error: { bg: 'bg-red-100', text: 'text-red-800', icon: '✕' },
    info: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'ℹ' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⚠' },
  };

  const styles = typeStyles[type];

  return (
    <div className={`${styles.bg} ${styles.text} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3`}>
      <span className="text-lg font-semibold">{styles.icon}</span>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-auto text-xl font-bold">
          ×
        </button>
      )}
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>;
  onRemoveToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 max-w-md">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </div>
  );
};
