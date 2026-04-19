import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useOnlineStatus, useGeolocation } from '../hooks';
import { logout, updateLocation } from '../lib/api';

// Dynamic style function - extracted to avoid mixed types in styles object
const getStatusBadgeStyle = (online: boolean): React.CSSProperties => ({
  padding: '0.25rem 0.75rem',
  borderRadius: '9999px',
  fontSize: '0.75rem',
  fontWeight: 600,
  background: online ? '#22c55e' : '#ef4444',
});

export default function ProfilePage() {
  const { volunteer, refresh } = useAuth();
  const online = useOnlineStatus();
  const { location, refresh: refreshLocation } = useGeolocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    await refresh();
    navigate('/login');
  };

  const handleUpdateLocation = async () => {
    if (!location) {
      refreshLocation();
      return;
    }
    const result = await updateLocation(location.lat, location.lon);
    if (result.success) {
      alert('Location updated!');
    }
  };

  if (!volunteer) {
    return <p>Loading...</p>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Profile</h1>
        <div style={getStatusBadgeStyle(online)}>
          {online ? 'Online' : 'Offline'}
        </div>
      </header>

      <div style={styles.content}>
        {/* Profile Card */}
        <div style={styles.card}>
          <div style={styles.avatar}>
            {volunteer.name.charAt(0).toUpperCase()}
          </div>
          <h2 style={styles.name}>{volunteer.name}</h2>
          <p style={styles.phone}>{volunteer.phone}</p>
        </div>

        {/* Skills */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Skills</h3>
          <div style={styles.skills}>
            {volunteer.skills.map((skill) => (
              <span key={skill} style={styles.skillBadge}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Location */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Location</h3>
          {location ? (
            <p style={styles.locationText}>
              {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
            </p>
          ) : (
            <p style={styles.locationText}>Location not available</p>
          )}
          <button onClick={handleUpdateLocation} style={styles.locationBtn}>
            Update Location
          </button>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      {/* Bottom Nav */}
      <nav style={styles.nav}>
        <button style={styles.navItem} onClick={() => navigate('/tasks')}>
          Tasks
        </button>
        <button style={{ ...styles.navItem, color: '#1e40af' }}>
          Profile
        </button>
      </nav>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#f1f5f9',
    paddingBottom: '4rem',
  },
  header: {
    background: '#1e40af',
    color: 'white',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
  },
  content: {
    padding: '1rem',
  },
  card: {
    background: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#1e40af',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 700,
    margin: '0 auto 1rem',
  },
  name: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#1f2937',
  },
  phone: {
    margin: '0.25rem 0 0',
    color: '#64748b',
  },
  section: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: '1rem',
    marginTop: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    margin: '0 0 0.75rem',
    fontSize: '1rem',
    color: '#374151',
  },
  skills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  skillBadge: {
    padding: '0.375rem 0.75rem',
    background: '#e0e7ff',
    color: '#3730a3',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  locationText: {
    margin: '0 0 0.75rem',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  locationBtn: {
    padding: '0.5rem 1rem',
    background: '#f1f5f9',
    border: '1px solid #e5e7eb',
    borderRadius: '0.375rem',
    color: '#374151',
    fontWeight: 500,
    cursor: 'pointer',
  },
  logoutBtn: {
    width: '100%',
    marginTop: '1.5rem',
    padding: '1rem',
    background: '#fee2e2',
    border: 'none',
    borderRadius: '0.75rem',
    color: '#dc2626',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'white',
    display: 'flex',
    borderTop: '1px solid #e5e7eb',
  },
  navItem: {
    flex: 1,
    padding: '1rem',
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
