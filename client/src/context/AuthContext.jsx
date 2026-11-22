import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshCartCount = async () => {
    if (!localStorage.getItem('token') || user?.role !== 'user') {
      setCartCount(0);
      return;
    }
    try {
      const { data } = await api.get('/cart');
      setCartCount(data.count || 0);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (user?.role === 'user') {
      refreshCartCount();
    }
  }, [user]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCartCount(0);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      cartCount,
      setCartCount,
      login,
      logout,
      refreshUser,
      refreshCartCount,
    }),
    [user, loading, cartCount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}