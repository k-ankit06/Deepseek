import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { apiMethods } from '../utils/api';
import { STORAGE_KEYS } from '../constants';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from AsyncStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        const savedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);

        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);

          // Verify token with server (optional, can skip if offline)
          // await apiMethods.refreshToken();
        }
      } catch (error) {
        // Token is invalid, clear storage
        await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email, password, additionalData = {}) => {
    try {
      setLoading(true);
      // specific logic if role is passed directly or as part of additionalData
      const payload = { email, password, ...additionalData };
      const response = await apiMethods.login(payload);

      const { token, user: userData } = response.data || response; // Handle if response is data or wrapper

      if (token && userData) {
        // Store token and user data
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, user: userData };
      } else {
         throw new Error('Invalid response from server');
      }

    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiMethods.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      // Clear local storage
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);

      // Clear state
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
