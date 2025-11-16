import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Session timeout: 20 minutes (in milliseconds)
  const SESSION_TIMEOUT = 20 * 60 * 1000;

  useEffect(() => {
    // Check for existing session on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedLastActivity = localStorage.getItem('lastActivity');
    
    if (storedToken && storedUser && storedLastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(storedLastActivity);
      
      // If session hasn't expired, restore it
      if (timeSinceLastActivity < SESSION_TIMEOUT) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setLastActivity(Date.now());
        localStorage.setItem('lastActivity', Date.now().toString());
      } else {
        // Session expired, clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivity');
      }
    }
    setLoading(false);
  }, []);

  // Track user activity and check for session timeout
  useEffect(() => {
    if (!token) return;

    const updateActivity = () => {
      const now = Date.now();
      setLastActivity(now);
      localStorage.setItem('lastActivity', now.toString());
    };

    // Update activity on these events
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    // Check for session timeout every minute
    const timeoutCheck = setInterval(() => {
      const storedLastActivity = localStorage.getItem('lastActivity');
      if (storedLastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(storedLastActivity);
        
        if (timeSinceLastActivity >= SESSION_TIMEOUT) {
          // Session expired
          alert('Your session has expired due to inactivity. Please log in again.');
          logout();
        }
      }
    }, 60000); // Check every minute

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(timeoutCheck);
    };
  }, [token]);

  const signup = async (userData) => {
    try {
      const response = await authService.signup(userData);
      const { token, user } = response;
      
      const now = Date.now();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('lastActivity', now.toString());
      
      setToken(token);
      setUser(user);
      setLastActivity(now);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Signup failed' 
      };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { token, user } = response;
      
      const now = Date.now();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('lastActivity', now.toString());
      
      setToken(token);
      setUser(user);
      setLastActivity(now);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    setToken(null);
    setUser(null);
    setLastActivity(Date.now());
  };

  const value = {
    user,
    token,
    loading,
    signup,
    login,
    logout,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
