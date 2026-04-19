import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>SevaSync Dashboard</h1>
        <p style={styles.subtitle}>Coordinator Login</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1e293b',
  },
  form: {
    background: 'white',
    padding: '2.5rem',
    borderRadius: '1rem',
    width: '100%',
    maxWidth: '400px',
  },
  title: { margin: 0, textAlign: 'center', color: '#1e293b' },
  subtitle: { textAlign: 'center', color: '#64748b', marginBottom: '2rem' },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '1rem',
  },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: '0 0 1rem' },
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
