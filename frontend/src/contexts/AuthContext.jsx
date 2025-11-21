// frontend/src/contexts/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../services/api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('userEmail');
    if (storedToken) {
      setToken(storedToken);
      setUserEmail(storedEmail);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await apiLogin(email, password);
    localStorage.setItem('token', response.token);
    localStorage.setItem('userEmail', email);
    setToken(response.token);
    setUserEmail(email);
    return response;
  };

  const register = async (email, password, name) => {
    const response = await apiRegister(email, password, name);
    localStorage.setItem('token', response.token);
    localStorage.setItem('userEmail', email);
    setToken(response.token);
    setUserEmail(email);
    return response;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      setToken(null);
      setUserEmail(null);
    }
  };

  const isAuthenticated = () => !!token;

  const value = { token, userEmail, login, register, logout, isAuthenticated, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};