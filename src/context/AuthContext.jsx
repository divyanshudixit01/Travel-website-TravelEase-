import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getUserProfile, updateUserProfile } from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('travelease_auth_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('travelease_token');
  });

  const [loading, setLoading] = useState(false);

  // Sync user state with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('travelease_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('travelease_auth_user');
    }
  }, [user]);

  // Hydrate & verify live session from MongoDB on initial mount
  useEffect(() => {
    const token = localStorage.getItem('travelease_token');
    if (token) {
      getUserProfile()
        .then((res) => {
          if (res?.user) {
            setUser(res.user);
            setIsAuthenticated(true);
          }
        })
        .catch((err) => {
          // If token has expired or is invalid, clear stale credentials
          if (err.response?.status === 401) {
            localStorage.removeItem('travelease_token');
            localStorage.removeItem('travelease_auth_user');
            setUser(null);
            setIsAuthenticated(false);
          }
        });
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      localStorage.setItem('travelease_token', res.token);
      localStorage.setItem('travelease_user_email', res.user?.email || email);
      setUser(res.user);
      setIsAuthenticated(true);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      // Specific error from backend API (e.g. 400 Invalid credentials)
      if (err.response?.data?.message) {
        return { success: false, message: err.response.data.message };
      }
      
      // If backend is unreachable, inform the user clearly
      const errMsg = err.code === 'ERR_NETWORK' 
        ? 'Cannot connect to authentication server. Please check your network or ensure backend is running.'
        : (err.message || 'Invalid credentials. Please try again.');
      return { success: false, message: errMsg };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await registerUser(userData);
      localStorage.setItem('travelease_token', res.token);
      localStorage.setItem('travelease_user_email', res.user?.email || userData.email);
      setUser(res.user);
      setIsAuthenticated(true);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      if (err.response?.data?.message) {
        return { success: false, message: err.response.data.message };
      }
      const errMsg = err.code === 'ERR_NETWORK'
        ? 'Cannot connect to authentication server. Please check your network or ensure backend is running.'
        : (err.message || 'Registration failed. Please try again.');
      return { success: false, message: errMsg };
    }
  };

  const updateUser = async (updatedFields) => {
    try {
      const updatedUser = { ...(user || {}), ...updatedFields };
      setUser(updatedUser);
      localStorage.setItem('travelease_auth_user', JSON.stringify(updatedUser));

      if (isAuthenticated && localStorage.getItem('travelease_token')) {
        await updateUserProfile(updatedFields);
      }
      return { success: true, user: updatedUser };
    } catch (err) {
      console.warn('Profile update locally persisted. Backend sync warning:', err);
      return { success: true, user: { ...(user || {}), ...updatedFields } };
    }
  };

  const logout = () => {
    localStorage.removeItem('travelease_token');
    localStorage.removeItem('travelease_auth_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;