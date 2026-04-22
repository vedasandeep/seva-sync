import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Check, X } from 'lucide-react';
import { PasswordStrengthMeter } from '../features/auth/components/PasswordStrengthMeter';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpMethod, setOtpMethod] = useState<'email' | 'sms'>('email');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();

  const passwordsMatch = password === confirmPassword && password.length >= 8;
  const isFormValid = email && name && password && confirmPassword && passwordsMatch && otpVerified;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Mock OTP send
      const mockOtp = '123456';
      console.log(`Mock OTP sent to ${otpMethod}: ${mockOtp}`);
      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '123456') {
      setOtpVerified(true);
      setError('');
    } else {
      setError('Invalid OTP. Demo OTP is 123456');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError('');
    try {
      // Mock registration
      console.log('User registered:', { email, name, phone, otpMethod });
      navigate('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>SevaSync</h1>
          <p style={styles.subtitle}>Create Your Account</p>
        </div>

        <form onSubmit={otpSent ? (otpVerified ? handleRegister : handleVerifyOtp) : handleSendOtp} style={styles.form}>
          {error && (
            <div style={styles.errorAlert}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {!otpSent ? (
            <>
              <h2 style={styles.formTitle}>Account Details</h2>

              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                  required
                  disabled={loading}
                />
              </div>

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

              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
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

              <button type="submit" disabled={loading || !email || !name || !password || !confirmPassword} style={styles.button}>
                {loading ? 'Sending OTP...' : 'Continue'}
              </button>
            </>
          ) : !otpVerified ? (
            <>
              <h2 style={styles.formTitle}>Verify Your {otpMethod === 'email' ? 'Email' : 'Phone'}</h2>

              <div style={styles.formGroup}>
                <label style={styles.label}>OTP Method</label>
                <div style={styles.methodToggle}>
                  <button
                    type="button"
                    onClick={() => setOtpMethod('email')}
                    style={{
                      ...styles.methodButton,
                      ...(otpMethod === 'email' ? styles.methodButtonActive : {}),
                    }}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpMethod('sms')}
                    style={{
                      ...styles.methodButton,
                      ...(otpMethod === 'sms' ? styles.methodButtonActive : {}),
                    }}
                  >
                    SMS
                  </button>
                </div>
              </div>

              {otpMethod === 'sms' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={styles.input}
                    required
                    disabled={loading}
                  />
                </div>
              )}

              <div style={styles.infoAlert}>
                <p style={styles.infoText}>
                  A verification code has been sent to your {otpMethod === 'email' ? 'email' : 'phone'}. Demo OTP is <strong>123456</strong>
                </p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Verification Code</label>
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  style={styles.input}
                  maxLength={6}
                  required
                />
              </div>

              <button type="submit" disabled={loading || otp.length !== 6} style={styles.button}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                style={styles.secondaryButton}
                disabled={loading}
              >
                Resend OTP
              </button>
            </>
          ) : (
            <>
              <h2 style={styles.formTitle}>Account Created!</h2>
              <p style={styles.successText}>Your account has been verified. Please log in to continue.</p>
              <button type="submit" style={styles.button}>
                Complete Registration
              </button>
            </>
          )}

          <p style={styles.loginLink}>
            Already have an account? <Link to="/login" style={styles.link}>Login</Link>
          </p>
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
    fontSize: '2rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    margin: '0.5rem 0 0',
    fontSize: '0.875rem',
    color: '#cbd5e1',
  },
  form: {
    background: 'white',
    padding: '2rem',
    borderRadius: '0.75rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  formTitle: {
    margin: '0 0 1.5rem',
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#1e293b',
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
  methodToggle: {
    display: 'flex',
    gap: '0.75rem',
  },
  methodButton: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    background: 'white',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#64748b',
  },
  methodButtonActive: {
    background: '#1e40af',
    color: 'white',
    borderColor: '#1e40af',
  },
  infoAlert: {
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    background: '#dbeafe',
    color: '#075985',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
  },
  infoText: {
    margin: 0,
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
    marginBottom: '0.75rem',
  },
  secondaryButton: {
    width: '100%',
    padding: '0.875rem',
    background: 'white',
    color: '#1e40af',
    border: '1px solid #1e40af',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  successText: {
    color: '#16a34a',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  loginLink: {
    margin: '1rem 0 0',
    fontSize: '0.875rem',
    color: '#64748b',
    textAlign: 'center',
  },
  link: {
    color: '#1e40af',
    textDecoration: 'none',
    fontWeight: 600,
  },
};
