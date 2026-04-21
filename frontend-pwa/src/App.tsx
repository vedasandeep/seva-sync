import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './features/auth/hooks';
import { ErrorBoundary } from './components';
import LoginPage from './pages/LoginPage';
import TasksPage from './pages/TasksPage';
import ProfilePage from './pages/ProfilePage';
import { initDB } from './lib/db';
import { useBackgroundSync } from './hooks/useBackgroundSync';
import { useEffect, useState } from 'react';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-600 text-white text-xl">
        Loading...
      </div>
    );
  }

  return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  
  // Start background sync after DB is ready
  useBackgroundSync();

  useEffect(() => {
    initDB().then(() => setDbReady(true));
  }, []);

  if (!dbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-600 text-white text-xl">
        Loading SevaSync...
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
