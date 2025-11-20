import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services';
import { useNotification } from './NotificationContext';
import { disconnectSocket } from '../services/socket';

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
  const { showNotification } = useNotification();

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
          showNotification('Your session has expired due to inactivity. Please log in again.', 'warning', 6000);
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
      
      showNotification(`Welcome to SkillSwap, ${user.firstName}!`, 'success');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed';
      showNotification(errorMessage, 'error');
      return { 
        success: false, 
        error: errorMessage
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
      
      showNotification(`Welcome back, ${user.firstName}!`, 'success');
      
      // Check for unread messages
      checkUnreadMessages();
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      showNotification(errorMessage, 'error');
      return { 
        success: false, 
        error: errorMessage
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
    
    // Disconnect socket on logout
    disconnectSocket();
    
    showNotification('You have been logged out successfully.', 'info');
  };

  const checkUnreadMessages = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/chat/unread/count`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.count > 0) {
        showNotification(`You have ${data.count} unread message${data.count > 1 ? 's' : ''}`, 'info', 7000);
      }
    } catch (error) {
      console.error('Failed to check unread messages:', error);
    }
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
