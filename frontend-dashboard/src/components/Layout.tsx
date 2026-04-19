import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>SevaSync</div>
        <nav style={styles.nav}>
          <NavLink to="/dashboard" style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.active : {}) })}>
            Dashboard
          </NavLink>
          <NavLink to="/disasters" style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.active : {}) })}>
            Disasters
          </NavLink>
          <NavLink to="/tasks" style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.active : {}) })}>
            Tasks
          </NavLink>
          <NavLink to="/volunteers" style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.active : {}) })}>
            Volunteers
          </NavLink>
        </nav>
        <div style={styles.user}>
          <div style={styles.userName}>{user?.name}</div>
          <div style={styles.userRole}>{user?.role}</div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', minHeight: '100vh' },
  sidebar: {
    width: '240px',
    background: '#1e293b',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem 0',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 700,
    padding: '0 1.5rem 1.5rem',
    borderBottom: '1px solid #334155',
  },
  nav: { flex: 1, padding: '1rem 0' },
  navLink: {
    display: 'block',
    padding: '0.75rem 1.5rem',
    color: '#94a3b8',
    textDecoration: 'none',
    fontWeight: 500,
  },
  active: { background: '#334155', color: 'white' },
  user: { padding: '1rem 1.5rem', borderTop: '1px solid #334155' },
  userName: { fontWeight: 600 },
  userRole: { fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' },
  logoutBtn: {
    width: '100%',
    padding: '0.5rem',
    background: '#475569',
    border: 'none',
    borderRadius: '0.375rem',
    color: 'white',
    cursor: 'pointer',
  },
  main: { flex: 1, background: '#f1f5f9', overflow: 'auto' },
};
