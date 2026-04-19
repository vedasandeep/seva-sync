import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginVolunteer } from '../lib/api';
import { useAuth } from '../hooks';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Format phone number
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone.replace(/^0/, '');
    }

    const result = await loginVolunteer(formattedPhone);

    if (result.success) {
      await refresh();
      navigate('/tasks');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>SevaSync</h1>
        <p style={styles.subtitle}>Volunteer Login</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Phone Number
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              style={styles.input}
              required
            />
          </label>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.hint}>
          Enter your registered phone number to login.
          <br />
          New volunteer? Contact your coordinator.
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
    padding: '1rem',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
  },
  card: {
    background: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    color: '#1e40af',
    textAlign: 'center',
  },
  subtitle: {
    margin: '0.5rem 0 2rem',
    color: '#64748b',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    color: '#374151',
    fontWeight: 500,
  },
  input: {
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '0.875rem 1rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: 'white',
    background: '#1e40af',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  error: {
    color: '#dc2626',
    fontSize: '0.875rem',
    margin: 0,
  },
  hint: {
    marginTop: '1.5rem',
    fontSize: '0.875rem',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 1.5,
  },
};
