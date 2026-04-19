import { useEffect, useState } from 'react';
import { disasters } from '../lib/api';

interface Disaster {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string;
  totalTasks?: number;
  completedTasks?: number;
  openTasks?: number;
}

export default function DisastersPage() {
  const [list, setList] = useState<Disaster[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'FLOOD',
    location: '',
    latitude: '',
    longitude: '',
    startDate: new Date().toISOString().slice(0, 16), // datetime-local format
  });

  useEffect(() => {
    loadDisasters();
  }, []);

  const loadDisasters = () => {
    disasters.list().then(setList).catch((err) => setError(err.message));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await disasters.create({
        name: form.name,
        type: form.type,
        location: form.location,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        startDate: new Date(form.startDate).toISOString(),
      });
      setShowForm(false);
      setForm({ 
        name: '', 
        type: 'FLOOD', 
        location: '', 
        latitude: '', 
        longitude: '', 
        startDate: new Date().toISOString().slice(0, 16) 
      });
      loadDisasters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create disaster');
    }
  };

  const handleActivate = async (id: string) => {
    setError(null);
    try {
      await disasters.activate(id);
      loadDisasters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate disaster');
    }
  };

  const handleResolve = async (id: string) => {
    setError(null);
    try {
      await disasters.resolve(id);
      loadDisasters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve disaster');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Disasters</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? 'Cancel' : '+ New Disaster'}
        </button>
      </div>

      {error && (
        <div style={styles.error}>{error}</div>
      )}

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <input 
              placeholder="Name (e.g., Hyderabad Floods 2026)" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              style={styles.input} 
              required 
            />
            <select 
              value={form.type} 
              onChange={(e) => setForm({ ...form, type: e.target.value })} 
              style={styles.input}
            >
              <option value="FLOOD">Flood</option>
              <option value="CYCLONE">Cyclone</option>
              <option value="EARTHQUAKE">Earthquake</option>
              <option value="LANDSLIDE">Landslide</option>
              <option value="FIRE">Fire</option>
              <option value="OTHER">Other</option>
            </select>
            <input 
              placeholder="Location (e.g., Hyderabad, Telangana)" 
              value={form.location} 
              onChange={(e) => setForm({ ...form, location: e.target.value })} 
              style={styles.input} 
              required 
            />
            <input 
              placeholder="Latitude (optional)" 
              type="number" 
              step="any" 
              value={form.latitude} 
              onChange={(e) => setForm({ ...form, latitude: e.target.value })} 
              style={styles.input} 
            />
            <input 
              placeholder="Longitude (optional)" 
              type="number" 
              step="any" 
              value={form.longitude} 
              onChange={(e) => setForm({ ...form, longitude: e.target.value })} 
              style={styles.input} 
            />
            <input 
              type="datetime-local" 
              value={form.startDate} 
              onChange={(e) => setForm({ ...form, startDate: e.target.value })} 
              style={styles.input} 
              required 
            />
          </div>
          <button type="submit" style={styles.submitBtn}>Create Disaster</button>
        </form>
      )}

      {/* List */}
      <div style={styles.list}>
        {list.length === 0 ? (
          <div style={styles.empty}>No disasters found. Create one to get started.</div>
        ) : (
          list.map((d) => (
            <div key={d.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{d.name}</h3>
                <span style={{ ...styles.badge, background: d.status === 'ACTIVE' ? '#22c55e' : d.status === 'PLANNING' ? '#f59e0b' : '#64748b' }}>
                  {d.status}
                </span>
              </div>
              <div style={styles.cardMeta}>
                <span>{d.type}</span>
                <span>{d.location}</span>
                {d.totalTasks !== undefined && (
                  <span>Tasks: {d.completedTasks}/{d.totalTasks}</span>
                )}
              </div>
              <div style={styles.cardActions}>
                {d.status === 'PLANNING' && (
                  <button onClick={() => handleActivate(d.id)} style={styles.actionBtn}>Activate</button>
                )}
                {d.status === 'ACTIVE' && (
                  <button onClick={() => handleResolve(d.id)} style={{ ...styles.actionBtn, background: '#64748b' }}>Resolve</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { margin: 0, color: '#1e293b' },
  addBtn: { padding: '0.75rem 1.5rem', background: '#1e40af', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' },
  error: { background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #fecaca' },
  form: { background: 'white', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' },
  input: { padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontSize: '0.875rem' },
  submitBtn: { padding: '0.75rem 1.5rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' },
  list: { display: 'grid', gap: '1rem' },
  empty: { background: 'white', padding: '2rem', borderRadius: '0.75rem', textAlign: 'center', color: '#64748b' },
  card: { background: 'white', padding: '1.25rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  cardTitle: { margin: 0, fontSize: '1.125rem' },
  badge: { padding: '0.25rem 0.75rem', borderRadius: '9999px', color: 'white', fontSize: '0.75rem', fontWeight: 600 },
  cardMeta: { display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' },
  cardActions: { display: 'flex', gap: '0.5rem' },
  actionBtn: { padding: '0.5rem 1rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: 500, cursor: 'pointer' },
};
