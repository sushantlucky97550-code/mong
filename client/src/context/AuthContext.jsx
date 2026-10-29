import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const DEMO_CREDENTIALS = {
  hr: {
    email: 'hr@staffsync.com',
    password: 'password123',
    label: 'HR Admin (Sarah Jenkins)',
    role: 'hr',
  },
  manager: {
    email: 'manager@staffsync.com',
    password: 'password123',
    label: 'Manager (Marcus Vance)',
    role: 'manager',
  },
  employee: {
    email: 'employee@staffsync.com',
    password: 'password123',
    label: 'Employee (Alex Rivera)',
    role: 'employee',
  },
};

const DEFAULT_HR_USER = {
  name: 'Sarah Jenkins',
  email: 'hr@staffsync.com',
  role: 'hr',
  department: 'Human Resources',
  position: 'VP of Human Resources',
  phone: '+1 (555) 234-5678',
  address: '742 Evergreen Terrace, Springfield, CA',
  salary: 125000,
  status: 'Active',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  leaveBalances: { annual: 18, sick: 12, casual: 10 },
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('staffsync_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('staffsync_user');
      return savedUser ? JSON.parse(savedUser) : DEFAULT_HR_USER;
    } catch {
      return DEFAULT_HR_USER;
    }
  });
  const [loading, setLoading] = useState(false);

  // Auto-authenticate on mount to ensure fresh token from backend without any login prompt
  useEffect(() => {
    const autoAuthenticate = async () => {
      try {
        const savedRole = user?.role || 'hr';
        const creds = DEMO_CREDENTIALS[savedRole] || DEMO_CREDENTIALS.hr;
        
        const response = await api.post('/auth/login', {
          email: creds.email,
          password: creds.password,
        });

        if (response.data.success) {
          const { token: newToken, user: userData } = response.data;
          localStorage.setItem('staffsync_token', newToken);
          localStorage.setItem('staffsync_user', JSON.stringify(userData));
          setToken(newToken);
          setUser(userData);
        }
      } catch (err) {
        console.warn('Auto-authentication using fallback session:', err.message);
      }
    };

    autoAuthenticate();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('staffsync_token', newToken);
        localStorage.setItem('staffsync_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Authentication error',
      };
    }
  };

  const quickLogin = async (roleKey) => {
    const creds = DEMO_CREDENTIALS[roleKey];
    if (creds) {
      return await login(creds.email, creds.password);
    }
    return { success: false, message: 'Invalid demo role selected' };
  };

  const logout = async () => {
    // Instead of locking out, reset to the default HR Admin account
    await quickLogin('hr');
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedUser };
      localStorage.setItem('staffsync_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        quickLogin,
        logout,
        updateUser,
        isAuthenticated: true, // Always authenticated so app loads directly
        isHR: user?.role === 'hr',
        isManager: user?.role === 'manager',
        isEmployee: user?.role === 'employee',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
