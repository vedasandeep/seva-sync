import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks';
import { useOffline } from '../hooks';
import { logout, updateLocation } from '../lib/api';
import { Layout, Card, Button, Badge, Avatar } from '../components';

export default function ProfilePage() {
  const { volunteer, logout: logoutStore } = useAuth();
  const { isOffline } = useOffline();
  const navigate = useNavigate();
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);

  // Get location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (err) => console.error('Geolocation error:', err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
      logoutStore();
      navigate('/login');
    }
  };

  const handleUpdateLocation = async () => {
    if (!location) {
      alert('Location not available. Please enable location services.');
      return;
    }

    setLoading(true);
    try {
      const result = await updateLocation(location.lat, location.lon);
      if (result.success) {
        alert('Location updated successfully!');
      } else {
        alert('Failed to update location: ' + (result.error || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!volunteer) {
    return (
      <Layout title="Profile">
        <p className="text-center text-gray-600">Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout title="Profile" volunteerName={volunteer.name}>
      <div className="space-y-6 max-w-2xl">
        {/* Profile Header */}
        <Card>
          <div className="flex items-start gap-4">
            <Avatar name={volunteer.name} size="lg" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{volunteer.name}</h2>
              <p className="text-gray-600 text-sm mt-1">📱 {volunteer.phone}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {volunteer.skills && volunteer.skills.length > 0 ? (
                  volunteer.skills.map((skill) => (
                    <Badge key={skill} variant="primary">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="default">No skills added</Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Location Section */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
          <div className="space-y-3">
            {location ? (
              <>
                <p className="text-gray-700 text-sm">
                  <span className="font-medium">Latitude:</span> {location.lat.toFixed(6)}
                </p>
                <p className="text-gray-700 text-sm">
                  <span className="font-medium">Longitude:</span> {location.lon.toFixed(6)}
                </p>
              </>
            ) : (
              <p className="text-gray-600 text-sm">Location not available</p>
            )}
            <Button
              onClick={handleUpdateLocation}
              loading={loading}
              disabled={!location || isOffline}
              variant="primary"
            >
              {loading ? 'Updating...' : 'Update Location'}
            </Button>
          </div>
        </Card>

        {/* Account Section */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
          <div className="space-y-3">
            <p className="text-gray-700 text-sm">
              <span className="font-medium">Status:</span>{' '}
              <Badge variant={isOffline ? 'warning' : 'success'}>
                {isOffline ? 'Offline' : 'Online'}
              </Badge>
            </p>
            {volunteer.lastSyncAt && (
              <p className="text-gray-600 text-sm">
                Last synced: {new Date(volunteer.lastSyncAt).toLocaleString()}
              </p>
            )}
            <Button
              onClick={handleLogout}
              variant="danger"
              fullWidth
            >
              Logout
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
