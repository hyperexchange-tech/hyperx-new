import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return null;
  }
};

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_BASE_URL = 'https://api.hyperx.llc';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = await SecureStore.getItemAsync('accessToken');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();

        let userId, userEmail;
        if (userData && userData.user) {
          userId = userData.user.id;
          userEmail = userData.user.email;
        } else if (userData && userData.id && userData.email) {
          userId = userData.id;
          userEmail = userData.email;
        }

        if (userId && userEmail) {
          setUser({ id: userId, email: userEmail });
        }
      } else {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
      }
    } catch (error) {
      console.error('Failed to re-establish session:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await SecureStore.setItemAsync('accessToken', data.token);
        if (data.refreshToken) {
          await SecureStore.setItemAsync('refreshToken', data.refreshToken);
        }

        const decodedPayload = decodeJwt(data.token);
        if (decodedPayload && decodedPayload.sub && decodedPayload.email) {
          const userObject = {
            id: decodedPayload.sub,
            email: decodedPayload.email,
          };
          setUser(userObject);
          Alert.alert('Success', `Welcome back, ${userObject.email}!`);
          return { success: true };
        }
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid email or password.');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'Network error. Please try again.');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Please check your email to verify your account.');
        return { success: true };
      } else {
        Alert.alert('Signup Failed', data.message || 'Please provide valid email and password.');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Signup Failed', 'Network error. Please try again.');
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    setUser(null);
    Alert.alert('Logged Out', 'You have been successfully logged out.');
  };

  const verifyEmail = async (email, otp) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.accessToken) {
          await SecureStore.setItemAsync('accessToken', data.accessToken);
          if (data.refreshToken) {
            await SecureStore.setItemAsync('refreshToken', data.refreshToken);
          }
          setUser(data.user || data);
        }
        Alert.alert('Success', 'Your email has been successfully verified!');
        setLoading(false);
        return { success: true };
      } else {
        Alert.alert('Verification Failed', data.message || 'Invalid verification code.');
        setLoading(false);
        return { success: false };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      Alert.alert('Verification Failed', 'Network error. Please try again.');
      setLoading(false);
      return { success: false };
    }
  };

  const submitBiodata = async (email, biodataFormData) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const decodedPayload = decodeJwt(token);
      if (!decodedPayload || !decodedPayload.sub) {
        throw new Error('Invalid authentication token');
      }

      const userId = decodedPayload.sub;

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: userId,
            email: email,
            first_name: biodataFormData.firstName.trim(),
            last_name: biodataFormData.lastName.trim(),
            identity_type: biodataFormData.identityType,
            identity_number: biodataFormData.identityNumber,
          },
        ])
        .select();

      if (error) {
        throw new Error(error.message || 'Failed to save biodata');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Submit biodata error:', error);
      Alert.alert('Error', error.message || 'Could not save your information.');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    verifyEmail,
    submitBiodata,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
