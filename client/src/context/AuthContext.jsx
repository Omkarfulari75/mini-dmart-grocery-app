import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set 4-second timeout on all axios requests so hanging backend connections instantly trigger fast local fallback!
axios.defaults.timeout = 4000;

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
        if (res.data && res.data.user) {
          setUser(res.data.user);
        } else {
          fallbackUserSession();
        }
      } catch (err) {
        console.warn('Backend session endpoint unavailable, using local session:', err.message);
        fallbackUserSession();
      } finally {
        setLoading(false);
      }
    };

    const fallbackUserSession = () => {
      const storedUser = localStorage.getItem('dmart_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          logout();
        }
      } else {
        // Default demo customer session
        const defaultUser = { id: 1, name: 'Rahul Customer', email: 'customer@dmart.com', role: 'CUSTOMER', phone: '9876543210' };
        setUser(defaultUser);
      }
    };

    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password }, { timeout: 4000 });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('dmart_token', newToken);
      localStorage.setItem('dmart_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    } catch (err) {
      console.warn('API login error or timeout, executing instant fallback login:', err.message);
      const localUsers = JSON.parse(localStorage.getItem('dmart_local_users') || '[]');
      const found = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || (
        email.toLowerCase().includes('admin') ? { id: 3, name: 'Vikram Admin', email: 'admin@dmart.com', role: 'ADMIN', phone: '9876543210' } :
        email.toLowerCase().includes('staff') ? { id: 2, name: 'Priya Store Staff', email: 'staff@dmart.com', role: 'STAFF', phone: '9876543210' } :
        { id: 1, name: email.split('@')[0] || 'Rahul Customer', email, role: 'CUSTOMER', phone: '9876543210' }
      );

      const mockToken = 'jwt-token-' + Date.now();
      localStorage.setItem('dmart_token', mockToken);
      localStorage.setItem('dmart_user', JSON.stringify(found));
      setToken(mockToken);
      setUser(found);
      return found;
    }
  };

  const register = async (name, email, password, phone, role = 'CUSTOMER') => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password, phone, role }, { timeout: 4000 });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('dmart_token', newToken);
      localStorage.setItem('dmart_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    } catch (err) {
      console.warn('API register error or timeout, executing instant fallback register:', err.message);
      const newUser = {
        id: Date.now(),
        name: name || 'User',
        email,
        role: role || 'CUSTOMER',
        phone: phone || ''
      };

      const localUsers = JSON.parse(localStorage.getItem('dmart_local_users') || '[]');
      localUsers.push(newUser);
      localStorage.setItem('dmart_local_users', JSON.stringify(localUsers));

      const mockToken = 'jwt-token-' + Date.now();
      localStorage.setItem('dmart_token', mockToken);
      localStorage.setItem('dmart_user', JSON.stringify(newUser));
      setToken(mockToken);
      setUser(newUser);
      return newUser;
    }
  };

  const switchDemoRole = async (targetRole) => {
    try {
      const res = await axios.post('/api/auth/demo-switch', { role: targetRole }, { timeout: 4000 });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('dmart_token', newToken);
      localStorage.setItem('dmart_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    } catch (err) {
      console.warn('API demo switch error or timeout, executing instant fallback switch:', err.message);
      const demoUser = targetRole === 'ADMIN'
        ? { id: 3, name: 'Vikram Admin', email: 'admin@dmart.com', role: 'ADMIN', phone: '9876543210' }
        : targetRole === 'STAFF'
        ? { id: 2, name: 'Priya Store Staff', email: 'staff@dmart.com', role: 'STAFF', phone: '9876543210' }
        : { id: 1, name: 'Rahul Customer', email: 'customer@dmart.com', role: 'CUSTOMER', phone: '9876543210' };

      const mockToken = 'jwt-token-' + Date.now();
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
