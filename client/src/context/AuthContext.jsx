import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dmart_token') || null);
  const [loading, setLoading] = useState(true);

  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data.user);
      } catch (err) {
        console.error('Session check fallback:', err);
        // Fallback local decode if offline
        const storedUser = localStorage.getItem('dmart_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('dmart_token', newToken);
      localStorage.setItem('dmart_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    } catch (err) {
      // Offline fallback login for demo accounts & registered accounts
      const localUsers = JSON.parse(localStorage.getItem('dmart_local_users') || '[]');
      const found = localUsers.find(u => u.email === email) || (
        email === 'admin@dmart.com' ? { id: 3, name: 'Vikram Admin', email: 'admin@dmart.com', role: 'ADMIN', phone: '9876543210' } :
        email === 'staff@dmart.com' ? { id: 2, name: 'Priya Store Staff', email: 'staff@dmart.com', role: 'STAFF', phone: '9876543210' } :
        email === 'customer@dmart.com' ? { id: 1, name: 'Rahul Customer', email: 'customer@dmart.com', role: 'CUSTOMER', phone: '9876543210' } : null
      );

      if (found) {
        const mockToken = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('dmart_token', mockToken);
        localStorage.setItem('dmart_user', JSON.stringify(found));
        setToken(mockToken);
        setUser(found);
        return found;
      }
      throw err;
    }
  };

  const register = async (name, email, password, phone, role = 'CUSTOMER') => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password, phone, role });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('dmart_token', newToken);
      localStorage.setItem('dmart_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    } catch (err) {
      // Offline fallback registration
      const newUser = {
        id: Date.now(),
        name,
        email,
        role: role || 'CUSTOMER',
        phone: phone || ''
      };

      const localUsers = JSON.parse(localStorage.getItem('dmart_local_users') || '[]');
      localUsers.push(newUser);
      localStorage.setItem('dmart_local_users', JSON.stringify(localUsers));

      const mockToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('dmart_token', mockToken);
      localStorage.setItem('dmart_user', JSON.stringify(newUser));
      setToken(mockToken);
      setUser(newUser);
      return newUser;
    }
  };

  const switchDemoRole = async (targetRole) => {
    try {
      const res = await axios.post('/api/auth/demo-switch', { role: targetRole });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('dmart_token', newToken);
      localStorage.setItem('dmart_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    } catch (err) {
      const demoUser = targetRole === 'ADMIN'
        ? { id: 3, name: 'Vikram Admin', email: 'admin@dmart.com', role: 'ADMIN', phone: '9876543210' }
        : targetRole === 'STAFF'
        ? { id: 2, name: 'Priya Store Staff', email: 'staff@dmart.com', role: 'STAFF', phone: '9876543210' }
        : { id: 1, name: 'Rahul Customer', email: 'customer@dmart.com', role: 'CUSTOMER', phone: '9876543210' };

      const mockToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('dmart_token', mockToken);
      localStorage.setItem('dmart_user', JSON.stringify(demoUser));
      setToken(mockToken);
      setUser(demoUser);
      return demoUser;
    }
  };

  const logout = () => {
    localStorage.removeItem('dmart_token');
    localStorage.removeItem('dmart_user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      switchDemoRole,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
