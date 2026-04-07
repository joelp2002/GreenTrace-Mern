import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const STORAGE_USER = 'gt_user';
const STORAGE_TOKEN = 'gt_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    setToken(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const t = localStorage.getItem(STORAGE_TOKEN);
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      localStorage.setItem(STORAGE_USER, JSON.stringify(data));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_USER);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_USER);
      }
    }
    refreshMe();
  }, [refreshMe]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem(STORAGE_TOKEN, data.token);
    localStorage.setItem(STORAGE_USER, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem(STORAGE_TOKEN, data.token);
    localStorage.setItem(STORAGE_USER, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const registerStaff = async (payload) => {
    const { data } = await api.post('/auth/staff', payload);
    return data;
  };

  const updateProfile = async (payload) => {
    const { data } = await api.patch('/auth/me', payload);
    setUser(data);
    localStorage.setItem(STORAGE_USER, JSON.stringify(data));
    return data;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      registerStaff,
      updateProfile,
      logout,
      refreshMe,
      isFRU: user?.role === 'FRU',
      isNGP: user?.role === 'NGP',
      isMES: user?.role === 'MES',
    }),
    [user, token, loading, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
