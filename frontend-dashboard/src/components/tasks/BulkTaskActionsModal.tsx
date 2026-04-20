import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface BulkTaskActionsModalProps {
  selectedCount: number;
  onClose: () => void;
  onStatusChange?: (newStatus: string) => void;
  onBulkAssign?: () => void;
  onDelete?: () => void;
}

export default function BulkTaskActionsModal({
  selectedCount,
  onClose,
  onStatusChange,
  onBulkAssign,
  onDelete,
}: BulkTaskActionsModalProps) {
  const [activeAction, setActiveAction] = useState<'status' | 'assign' | 'delete' | null>(null);

  const handleStatusChange = (status: string) => {
    onStatusChange?.(status);
    setActiveAction(null);
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Bulk Actions</h2>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Selection info */}
        <div style={styles.infoBox}>
          <AlertCircle size={16} style={{ color: '#3b82f6' }} />
          <span style={styles.infoText}>
            {selectedCount} task{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>

        {/* Action options */}
        <div style={styles.actionsContainer}>
          {/* Change Status */}
          <div style={styles.actionSection}>
            <button
              onClick={() => setActiveAction(activeAction === 'status' ? null : 'status')}
              style={{
                ...styles.actionBtn,
                background: activeAction === 'status' ? '#eff6ff' : 'white',
                borderColor: activeAction === 'status' ? '#3b82f6' : '#e2e8f0',
              }}
            >
              <span style={styles.actionIcon}>🔄</span>
              <div style={styles.actionContent}>
                <span style={styles.actionTitle}>Change Status</span>
                <span style={styles.actionDescription}>Update status for all selected tasks</span>
              </div>
            </button>

            {activeAction === 'status' && (
              <div style={styles.optionsPanel}>
                {['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    style={styles.optionBtn}
                  >
                    {status === 'COMPLETED' && <CheckCircle2 size={14} />}
                    {status === 'CANCELLED' && <AlertCircle size={14} />}
                    <span>{status}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bulk Assign */}
          <div style={styles.actionSection}>
            <button
              onClick={() => onBulkAssign?.()}
              style={{
                ...styles.actionBtn,
                background: activeAction === 'assign' ? '#eff6ff' : 'white',
                borderColor: activeAction === 'assign' ? '#3b82f6' : '#e2e8f0',
              }}
            >
              <span style={styles.actionIcon}>👥</span>
              <div style={styles.actionContent}>
                <span style={styles.actionTitle}>Bulk Assign</span>
                <span style={styles.actionDescription}>Assign same volunteer to all tasks</span>
              </div>
            </button>

            {activeAction === 'assign' && (
              <div style={styles.optionsPanel}>
                <span style={styles.optionLabel}>Coming soon: Select volunteer to assign</span>
              </div>
            )}
          </div>

          {/* Delete Tasks */}
          <div style={styles.actionSection}>
            <button
              onClick={() => setActiveAction(activeAction === 'delete' ? null : 'delete')}
              style={{
                ...styles.actionBtn,
                background: activeAction === 'delete' ? '#fee2e2' : 'white',
                borderColor: activeAction === 'delete' ? '#dc2626' : '#e2e8f0',
              }}
            >
              <span style={styles.actionIcon}>🗑️</span>
              <div style={styles.actionContent}>
                <span style={styles.actionTitle}>Delete Tasks</span>
                <span style={styles.actionDescription}>Permanently remove selected tasks</span>
              </div>
            </button>

            {activeAction === 'delete' && (
              <div style={{ ...styles.optionsPanel, background: '#fef2f2', borderColor: '#fecaca' }}>
                <div style={styles.warningBox}>
                  <AlertCircle size={16} style={{ color: '#dc2626' }} />
                  <span style={styles.warningText}>
                    This action cannot be undone. Delete {selectedCount} task
                    {selectedCount !== 1 ? 's' : ''}?
                  </span>
                </div>
                <button
                  onClick={() => {
                    onDelete?.();
                    setActiveAction(null);
                    onClose();
                  }}
                  style={styles.deleteConfirmBtn}
                >
                  ✓ Confirm Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelBtn}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 900,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  modal: {
    background: 'white',
    borderRadius: '0.75rem',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
  },
  header: {
    padding: '1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    color: '#64748b',
  },
  infoBox: {
    margin: '1rem 1.5rem',
    padding: '0.75rem 1rem',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  infoText: {
    fontSize: '0.875rem',
    color: '#1e40af',
    fontWeight: 600,
  },
  actionsContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 1.5rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  actionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  actionBtn: {
    padding: '1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    background: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    transition: 'all 0.2s',
  },
  actionIcon: {
    fontSize: '1.5rem',
    marginTop: '0.125rem',
  },
  actionContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    textAlign: 'left',
  },
  actionTitle: {
    display: 'block',
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  actionDescription: {
    display: 'block',
    fontSize: '0.8125rem',
    color: '#64748b',
  },
  optionsPanel: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  optionBtn: {
    padding: '0.625rem 0.75rem',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
  },
  optionLabel: {
    padding: '0.625rem 0.75rem',
    fontSize: '0.8125rem',
    color: '#64748b',
    fontStyle: 'italic',
  },
  warningBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.75rem',
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '0.375rem',
  },
  warningText: {
    fontSize: '0.8125rem',
    color: '#92400e',
    fontWeight: 500,
  },
  deleteConfirmBtn: {
    padding: '0.75rem',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.875rem',
  },
  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '0.625rem 1.25rem',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.875rem',
  },
};
