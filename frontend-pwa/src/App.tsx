import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks';
import LoginPage from './pages/LoginPage';
import TasksPage from './pages/TasksPage';
import ProfilePage from './pages/ProfilePage';
import { initDB } from './lib/db';
import { useEffect, useState } from 'react';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDB().then(() => setDbReady(true));
  }, []);

  if (!dbReady) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#1e40af',
        color: 'white',
        fontSize: '1.25rem'
      }}>
        Loading SevaSync...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/tasks"
          element={
            <PrivateRoute>
              <TasksPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/tasks" />} />
      </Routes>
    </BrowserRouter>
  );
}
