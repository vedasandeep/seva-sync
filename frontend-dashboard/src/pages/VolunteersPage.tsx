import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { volunteers } from '../lib/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Volunteer {
  id: string;
  name: string;
  skills: string[];
  isAvailable: boolean;
  currentLat?: number;
  currentLng?: number;
  burnoutScore: number;
}

export default function VolunteersPage() {
  const [list, setList] = useState<Volunteer[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    volunteers.list().then(setList);
  }, []);

  const filtered = list.filter((v) =>
    v.name.toLowerCase().includes(filter.toLowerCase()) ||
    v.skills.some((s) => s.toLowerCase().includes(filter.toLowerCase()))
  );

  const withLocation = filtered.filter((v) => v.currentLat && v.currentLng);

  // Center on India by default, or first volunteer with location
  const center: [number, number] = withLocation.length > 0
    ? [withLocation[0].currentLat!, withLocation[0].currentLng!]
    : [20.5937, 78.9629];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Volunteers</h1>
        <input
          placeholder="Search by name or skill..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={styles.search}
        />
      </div>

      <div style={styles.content}>
        {/* Map */}
        <div style={styles.mapContainer}>
          <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {withLocation.map((v) => (
              <Marker key={v.id} position={[v.currentLat!, v.currentLng!]}>
                <Popup>
                  <strong>{v.name}</strong><br />
                  {v.skills.join(', ')}<br />
                  {v.isAvailable ? '✅ Available' : '❌ Busy'}<br />
                  Burnout: {v.burnoutScore}/10
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* List */}
        <div style={styles.listContainer}>
          <h3 style={styles.listTitle}>All Volunteers ({filtered.length})</h3>
          <div style={styles.list}>
            {filtered.map((v) => (
              <div key={v.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.name}>{v.name}</span>
                  <span style={{ ...styles.status, background: v.isAvailable ? '#22c55e' : '#ef4444' }}>
                    {v.isAvailable ? 'Available' : 'Busy'}
                  </span>
                </div>
                <div style={styles.skills}>
                  {v.skills.map((s) => (
                    <span key={s} style={styles.skill}>{s}</span>
                  ))}
                </div>
                <div style={styles.meta}>
                  Burnout Score: <strong style={{ color: v.burnoutScore > 6 ? '#ef4444' : '#22c55e' }}>{v.burnoutScore}/10</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '2rem', height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { margin: 0, color: '#1e293b' },
  search: { padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', width: '300px' },
  content: { display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 },
  mapContainer: { flex: 2, background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' },
  listContainer: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
  listTitle: { margin: '0 0 1rem', color: '#1e293b' },
  list: { flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  card: { background: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  name: { fontWeight: 600, color: '#1e293b' },
  status: { padding: '0.25rem 0.5rem', borderRadius: '9999px', color: 'white', fontSize: '0.625rem', fontWeight: 600 },
  skills: { display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' },
  skill: { padding: '0.125rem 0.5rem', background: '#e0e7ff', color: '#3730a3', borderRadius: '9999px', fontSize: '0.75rem' },
  meta: { fontSize: '0.75rem', color: '#64748b' },
};
