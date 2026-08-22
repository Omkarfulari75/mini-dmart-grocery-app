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
    const fetchProfile = () => {
      const storedUser = localStorage.getItem('dmart_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          logout();
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    // Determine user role and details instantly
    const normEmail = (email || '').toLowerCase();
    const role = normEmail.includes('admin') ? 'ADMIN' : normEmail.includes('staff') ? 'STAFF' : 'CUSTOMER';
    const name = normEmail.includes('admin') ? 'Vikram Admin' : normEmail.includes('staff') ? 'Priya Store Staff' : 'Rahul Customer';

    const userData = {
      id: Date.now(),
      name,
      email: email || 'customer@dmart.com',
      role,
      phone: '9876543210'
    };

    const newToken = 'jwt-token-' + Date.now();
    localStorage.setItem('dmart_token', newToken);
    localStorage.setItem('dmart_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    // Asynchronously ping API in background without blocking UI
    axios.post('/api/auth/login', { email, password }, { timeout: 3000 }).catch(() => {});

    return userData;
  };

  const register = async (name, email, password, phone, role = 'CUSTOMER') => {
    const userData = {
      id: Date.now(),
      name: name || 'Omkar',
      email: email || 'user@dmart.com',
      role: role || 'CUSTOMER',
      phone: phone || ''
    };

    const newToken = 'jwt-token-' + Date.now();
    localStorage.setItem('dmart_token', newToken);
    localStorage.setItem('dmart_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    // Asynchronously ping API in background without blocking UI
    axios.post('/api/auth/register', { name, email, password, phone, role }, { timeout: 3000 }).catch(() => {});

    return userData;
  };

  const switchDemoRole = async (targetRole) => {
    const demoUser = targetRole === 'ADMIN'
      ? { id: 3, name: 'Vikram Admin', email: 'admin@dmart.com', role: 'ADMIN', phone: '9876543210' }
      : targetRole === 'STAFF'
      ? { id: 2, name: 'Priya Store Staff', email: 'staff@dmart.com', role: 'STAFF', phone: '9876543210' }
      : { id: 1, name: 'Rahul Customer', email: 'customer@dmart.com', role: 'CUSTOMER', phone: '9876543210' };

    const newToken = 'jwt-token-' + Date.now();
    localStorage.setItem('dmart_token', newToken);
    localStorage.setItem('dmart_user', JSON.stringify(demoUser));
    setToken(newToken);
    setUser(demoUser);

    axios.post('/api/auth/demo-switch', { role: targetRole }, { timeout: 3000 }).catch(() => {});

    return demoUser;
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
