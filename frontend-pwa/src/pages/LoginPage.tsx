import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginVolunteer } from '../lib/api';
import { useAuth } from '../features/auth/hooks';
import { Button, Input, Card } from '../components';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // Redirect if already logged in
  if (isLoggedIn) {
    navigate('/tasks');
    return null;
  }

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
      navigate('/tasks');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 to-blue-400">
      <Card className="w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">SevaSync</h1>
            <p className="text-gray-600">Volunteer Login</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="tel"
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              error={error ? error : undefined}
              helperText="Enter your registered phone number"
              required
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={!phone || loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Enter your registered phone number to login.
            <br />
            New volunteer? Contact your coordinator.
          </p>
        </div>
      </Card>
    </div>
  );
}
