import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, setToken, getToken } from './api';
import { webSocketService } from '../services/WebSocketService';
import { logger } from '../infrastructure/logger';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
   const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getToken()) {
      auth.me()
        .then((userData) => {
          setUser(userData);
          // Connect to WebSocket after user is authenticated
          const token = getToken();
          if (token && userData) {
            webSocketService
              .connect(token, userData.id)
              .catch((error) => {
                logger.error('Failed to connect WebSocket:', error);
              });
          }
        })
        .catch((error) => {
          logger.error('Failed to fetch user:', error);
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await auth.login(email, password);
    setToken(res.accessToken);
    const userData = { ...res.user, email };
    setUser(userData);
    
    // Connect to WebSocket after login
    try {
      await webSocketService.connect(res.accessToken, userData.id);
    } catch (error) {
      logger.error('Failed to connect WebSocket after login:', error);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    // Disconnect WebSocket on logout
    webSocketService.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
