import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Check, X } from 'lucide-react';
import { PasswordStrengthMeter } from '../../auth/components/PasswordStrengthMeter';

interface PasswordChangeProps {
  onSuccess: (message: string) => void;
}

export const PasswordChange: React.FC<PasswordChangeProps> = ({ onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordsMatch = newPassword === confirmPassword && newPassword.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordsMatch) {
      setError('New passwords do not match');
      return;
    }

    if (!currentPassword) {
      setError('Current password is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mock API call
      console.log('Password change:', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onSuccess('Password changed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Change Password</h2>
      <p style={styles.description}>Update your password to keep your account secure</p>

      {error && (
        <div style={styles.errorAlert}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Current Password</label>
          <div style={styles.passwordWrapper}>
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={styles.input}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              style={styles.toggleButton}
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>New Password</label>
          <div style={styles.passwordWrapper}>
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              style={styles.toggleButton}
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <PasswordStrengthMeter password={newPassword} />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Confirm Password</label>
          <div style={styles.passwordWrapper}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.toggleButton}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {newPassword && confirmPassword && (
            <div style={styles.passwordCheck}>
              {passwordsMatch ? (
                <>
                  <Check size={16} style={{ color: '#16a34a' }} />
                  <span style={{ color: '#16a34a' }}>Passwords match</span>
                </>
              ) : (
                <>
                  <X size={16} style={{ color: '#dc2626' }} />
                  <span style={{ color: '#dc2626' }}>Passwords don't match</span>
                </>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !passwordsMatch}
          style={styles.button}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '600px',
  },
  title: {
    margin: '0 0 0.5rem',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  description: {
    margin: '0 0 1.5rem',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    marginBottom: '1.5rem',
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#334155',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    boxSizing: 'border-box',
  },
  toggleButton: {
    position: 'absolute',
    right: '0.75rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    padding: '0.25rem',
  },
  passwordCheck: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.5rem',
    fontSize: '0.875rem',
  },
  button: {
    padding: '0.875rem 1.5rem',
    background: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    width: 'fit-content',
  },
};

export default PasswordChange;
