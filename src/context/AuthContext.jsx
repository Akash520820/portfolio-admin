import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tokens now live in httpOnly cookies, invisible to JS, so on every page
  // load we ask the backend who (if anyone) the cookies belong to instead
  // of trusting anything cached in localStorage.
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (_) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  // If a silent token refresh ever fails (refresh token expired/invalid),
  // api.js dispatches this so every part of the app reacts, not just the
  // component that happened to make the failing request.
  useEffect(() => {
    const handleForcedLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const userData = { _id: data._id, name: data.name, email: data.email, role: data.role };
    setUser(userData);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // Even if the request fails, clear local state so the UI reflects "logged out".
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
