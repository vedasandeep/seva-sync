import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Check, X } from 'lucide-react';
import { PasswordStrengthMeter } from '../features/auth/components/PasswordStrengthMeter';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const passwordsMatch = password === confirmPassword && password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Mock password reset
      console.log('Password reset with token:', token);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div style={styles.container}>
        <div style={styles.formWrapper}>
          <div style={styles.header}>
            <h1 style={styles.title}>Invalid Link</h1>
            <p style={styles.subtitle}>
              The password reset link is invalid or has expired.
            </p>
          </div>
          <button
            onClick={() => navigate('/forgot-password')}
            style={styles.button}
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create New Password</h1>
          <p style={styles.subtitle}>
            {submitted
              ? 'Your password has been reset successfully'
              : 'Enter a strong password to regain access to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {!submitted ? (
            <>
              {error && (
                <div style={styles.errorAlert}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>New Password</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.toggleButton}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <PasswordStrengthMeter password={password} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Confirm Password</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
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
                <div style={styles.passwordCheck}>
                  {passwordsMatch ? (
                    <>
                      <Check size={16} style={{ color: '#16a34a' }} />
                      <span style={{ color: '#16a34a' }}>Passwords match</span>
                    </>
                  ) : password && confirmPassword ? (
                    <>
                      <X size={16} style={{ color: '#dc2626' }} />
                      <span style={{ color: '#dc2626' }}>Passwords don't match</span>
                    </>
                  ) : null}
                </div>
              </div>

              <button type="submit" disabled={loading || !passwordsMatch} style={styles.button}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </>
          ) : (
            <div style={styles.successAlert}>
              <h3 style={styles.successTitle}>Password Reset Successfully</h3>
              <p style={styles.successText}>
                Your password has been updated. You can now log in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                style={styles.button}
              >
                Go to Login
              </button>
            </div>
          )}
        </form>
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
  formWrapper: {
    width: '100%',
    maxWidth: '420px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
    color: 'white',
  },
  title: {
    margin: 0,
    fontSize: '1.875rem',
    fontWeight: 700,
  },
  subtitle: {
    margin: '0.75rem 0 0',
    fontSize: '0.875rem',
    color: '#cbd5e1',
  },
  form: {
    background: 'white',
    padding: '2rem',
    borderRadius: '0.75rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  formGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#334155',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
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
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
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
  successAlert: {
    padding: '1.5rem',
    background: '#f0fdf4',
    borderLeft: '4px solid #16a34a',
    borderRadius: '0.5rem',
  },
  successTitle: {
    margin: '0 0 0.75rem',
    color: '#16a34a',
    fontSize: '1.125rem',
    fontWeight: 600,
  },
  successText: {
    margin: '0 0 1.5rem',
    color: '#166534',
    fontSize: '0.875rem',
  },
};
