import { useEffect, useState } from 'react';
import { tasks, volunteers, disasters } from '../lib/api';

interface Task {
  id: string;
  title: string;
  status: string;
  urgency: string;
  assignedVolunteerId?: string;
}

interface Volunteer {
  id: string;
  name: string;
  isAvailable?: boolean;
}

export default function TasksPage() {
  const [list, setList] = useState<Task[]>([]);
  const [vols, setVols] = useState<Volunteer[]>([]);
  const [disasterList, setDisasterList] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [assignModal, setAssignModal] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    disasterId: '',
    urgency: 'MEDIUM',
    latitude: '',
    longitude: '',
    estimatedHours: '4',
    requiredSkills: '',
  });

  useEffect(() => {
    loadTasks();
    volunteers.list().then(setVols).catch(console.error);
    disasters.list({ status: 'ACTIVE' }).then(setDisasterList).catch(console.error);
  }, []);

  const loadTasks = () => {
    tasks.list().then(setList).catch((err) => setError(err.message));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!form.disasterId) {
      setError('Please select a disaster');
      return;
    }
    
    try {
      await tasks.create({
        title: form.title,
        description: form.description || undefined,
        disasterId: form.disasterId,
        urgency: form.urgency,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        estimatedHours: form.estimatedHours ? parseInt(form.estimatedHours) : undefined,
        requiredSkills: form.requiredSkills ? form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      });
      setShowForm(false);
      setForm({ title: '', description: '', disasterId: '', urgency: 'MEDIUM', latitude: '', longitude: '', estimatedHours: '4', requiredSkills: '' });
      loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleAssign = async (taskId: string, volunteerId: string) => {
    setError(null);
    try {
      await tasks.assign(taskId, volunteerId);
      setAssignModal(null);
      loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign task');
    }
  };

  const handleCancel = async (id: string) => {
    setError(null);
    try {
      await tasks.cancel(id);
      loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel task');
    }
  };

  const urgencyColors: Record<string, string> = { CRITICAL: '#dc2626', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e' };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Tasks</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>{showForm ? 'Cancel' : '+ New Task'}</button>
      </div>

      {error && (
        <div style={styles.error}>{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={styles.input} required />
            <select value={form.disasterId} onChange={(e) => setForm({ ...form, disasterId: e.target.value })} style={styles.input} required>
              <option value="">Select Disaster</option>
              {disasterList.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })} style={styles.input}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <input placeholder="Required Skills (comma sep)" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} style={styles.input} />
            <input placeholder="Latitude" type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} style={styles.input} required />
            <input placeholder="Longitude" type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} style={styles.input} required />
            <input placeholder="Est. Hours" type="number" value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })} style={styles.input} />
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...styles.input, width: '100%', minHeight: '80px' }} />
          {disasterList.length === 0 && (
            <div style={styles.warning}>No active disasters. Please create and activate a disaster first.</div>
          )}
          <button type="submit" style={styles.submitBtn} disabled={disasterList.length === 0}>Create Task</button>
        </form>
      )}

      {/* Task List */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Title</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Urgency</th>
            <th style={styles.th}>Assigned</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#64748b' }}>No tasks found</td>
            </tr>
          ) : (
            list.map((t) => (
              <tr key={t.id}>
                <td style={styles.td}>{t.title}</td>
                <td style={styles.td}><span style={{ ...styles.badge, background: t.status === 'COMPLETED' ? '#22c55e' : t.status === 'IN_PROGRESS' ? '#3b82f6' : '#64748b' }}>{t.status}</span></td>
                <td style={styles.td}><span style={{ ...styles.badge, background: urgencyColors[t.urgency] }}>{t.urgency}</span></td>
                <td style={styles.td}>{t.assignedVolunteerId ? vols.find((v) => v.id === t.assignedVolunteerId)?.name || 'Assigned' : '-'}</td>
                <td style={styles.td}>
                  {t.status === 'OPEN' && (
                    <>
                      <button onClick={() => setAssignModal(t.id)} style={styles.smallBtn}>Assign</button>
                      <button onClick={() => handleCancel(t.id)} style={{ ...styles.smallBtn, background: '#ef4444' }}>Cancel</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Assign Modal */}
      {assignModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Assign Volunteer</h3>
            <div style={styles.volList}>
              {vols.filter((v) => v.isAvailable !== false).length === 0 ? (
                <div style={{ color: '#64748b', textAlign: 'center' }}>No available volunteers</div>
              ) : (
                vols.filter((v) => v.isAvailable !== false).map((v) => (
                  <button key={v.id} onClick={() => handleAssign(assignModal, v.id)} style={styles.volBtn}>{v.name}</button>
                ))
              )}
            </div>
            <button onClick={() => setAssignModal(null)} style={styles.cancelBtn}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { margin: 0, color: '#1e293b' },
  addBtn: { padding: '0.75rem 1.5rem', background: '#1e40af', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' },
  error: { background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #fecaca' },
  warning: { background: '#fefce8', color: '#ca8a04', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' },
  form: { background: 'white', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' },
  input: { padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontSize: '0.875rem' },
  submitBtn: { padding: '0.75rem 1.5rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' },
  table: { width: '100%', background: 'white', borderRadius: '0.75rem', borderCollapse: 'collapse', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  th: { textAlign: 'left', padding: '1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 500 },
  td: { padding: '1rem', borderBottom: '1px solid #e2e8f0' },
  badge: { padding: '0.25rem 0.5rem', borderRadius: '0.25rem', color: 'white', fontSize: '0.75rem', fontWeight: 600 },
  smallBtn: { padding: '0.375rem 0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.25rem', marginRight: '0.5rem', cursor: 'pointer', fontSize: '0.75rem' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalContent: { background: 'white', padding: '2rem', borderRadius: '0.75rem', minWidth: '300px' },
  volList: { display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '1rem 0' },
  volBtn: { padding: '0.75rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.375rem', cursor: 'pointer', textAlign: 'left' },
  cancelBtn: { width: '100%', padding: '0.75rem', background: '#64748b', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' },
};
