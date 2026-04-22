import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Mock password reset email
      console.log('Password reset link sent to:', email);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <button
          onClick={() => navigate('/login')}
          style={styles.backButton}
        >
          <ArrowLeft size={18} />
          Back to Login
        </button>

        <div style={styles.header}>
          <h1 style={styles.title}>Reset Password</h1>
          <p style={styles.subtitle}>
            {submitted
              ? 'Check your email for reset instructions'
              : 'Enter your email address to receive a password reset link'}
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
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </>
          ) : (
            <div style={styles.successAlert}>
              <h3 style={styles.successTitle}>Check Your Email</h3>
              <p style={styles.successText}>
                We've sent a password reset link to <strong>{email}</strong>. Click the link to create a new password.
              </p>
              <p style={styles.successHint}>
                The link expires in 1 hour. If you don't see the email, check your spam folder.
              </p>
              <button
                onClick={() => navigate('/login')}
                style={styles.button}
              >
                Return to Login
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
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '2rem',
    color: 'white',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
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
    margin: '0 0 0.5rem',
    color: '#166534',
    fontSize: '0.875rem',
  },
  successHint: {
    margin: '0 0 1.5rem',
    color: '#86efac',
    fontSize: '0.75rem',
  },
};
