import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data.user);
        } catch (error) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password, otp = null) => {
    try {
      const payload = otp ? { email, password, otp } : { email, password };
      const res = await api.post('/auth/login', payload);
      
      if (res.data.requiresOtp) {
        toast.success(res.data.message || 'OTP sent successfully');
        return { requiresOtp: true };
      }

      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Logged in successfully');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
      return { success: false };
    }
  };

  const requestLoginOtp = async (email, password) => {
    try {
      const res = await api.post('/auth/send-login-otp', { email, password });
      toast.success(res.data.message || 'OTP sent successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
      return false;
    }
  };

  const requestRegisterOtp = async (email) => {
    try {
      const res = await api.post('/auth/send-register-otp', { email });
      toast.success(res.data.message || 'OTP sent successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
      return false;
    }
  };

  const register = async (name, email, password, otp) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, otp });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Registration successful');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, requestLoginOtp, register, requestRegisterOtp, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
