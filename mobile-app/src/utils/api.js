import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (!error.response) {
      console.warn('Network error:', error.message);
      return Promise.reject({ message: 'Network error', success: false });
    }

    const { status, data } = error.response;

    if (status === 401) {
      // Handle unauthorized (maybe logout)
      // AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
    } else if (status === 403) {
      Alert.alert('Error', 'You do not have permission to perform this action');
    } else if (status === 500) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } else {
      // Alert.alert('Error', data?.message || 'An error occurred');
    }

    return Promise.reject(error.response?.data || error);
  }
);

// API Methods
export const apiMethods = {
  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),

  // Schools/Classes
  getSchools: () => api.get('/schools'),
  getClasses: () => api.get('/classes'),

  // Students
  getStudents: (params) => api.get('/students', { params }),
  getStudent: (id) => api.get(`/students/${id}`),
  createStudent: (data) => api.post('/students', data),

  // Attendance
  markAttendance: (data) => api.post('/attendance/mark', data),
  captureAttendance: (data) => api.post('/attendance/capture', data),
  recognizeAttendance: (data) => api.post('/attendance/recognize', data),
  getDailyAttendance: (params) => api.get('/attendance/daily', { params }),

  // AI Service
  recognizeFaces: (image) => api.post('/ai/recognize', { image }),
};

export default api;
