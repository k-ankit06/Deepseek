import axios from 'axios'
import toast from 'react-hot-toast'
import { API_BASE_URL, STORAGE_KEYS, TOAST_MESSAGES } from '../constants'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add offline flag for offline requests
    if (config.offline) {
      config.headers['X-Offline-Mode'] = 'true'
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Handle success messages from server
    if (response.data?.message) {
      toast.success(response.data.message)
    }
    return response.data
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      toast.error(TOAST_MESSAGES.ERROR_NETWORK)
      return Promise.reject({ message: TOAST_MESSAGES.ERROR_NETWORK })
    }
    
    const { status, data } = error.response
    
    // Handle specific error cases
    switch (status) {
      case 401:
        toast.error(TOAST_MESSAGES.ERROR_UNAUTHORIZED)
        localStorage.removeItem(STORAGE_KEYS.TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
        window.location.href = '/login'
        break
        
      case 403:
        toast.error('You do not have permission to perform this action')
        break
        
      case 404:
        toast.error('Resource not found')
        break
        
      case 422:
        // Validation errors
        if (data.errors) {
          Object.values(data.errors).forEach(err => {
            toast.error(err[0])
          })
        }
        break
        
      case 500:
        toast.error(TOAST_MESSAGES.ERROR_GENERIC)
        break
        
      default:
        toast.error(data?.message || TOAST_MESSAGES.ERROR_GENERIC)
    }
    
    return Promise.reject(error.response?.data || error)
  }
)

// API Methods
export const apiMethods = {
  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // School
  getSchoolProfile: () => api.get('/school/profile'),
  updateSchoolProfile: (data) => api.put('/school/profile', data),
  
  // Classes
  getClasses: () => api.get('/classes'),
  createClass: (data) => api.post('/classes', data),
  updateClass: (id, data) => api.put(`/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/classes/${id}`),
  
  // Students
  getStudents: (params) => api.get('/students', { params }),
  getStudent: (id) => api.get(`/students/${id}`),
  createStudent: (data) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'photo' && data[key]) {
        formData.append('photo', data[key])
      } else {
        formData.append(key, data[key])
      }
    })
    return api.post('/students', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  updateStudent: (id, data) => api.put(`/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/students/${id}`),
  registerFace: (studentId, image) => api.post(`/students/${studentId}/face`, { image }),
  
  // Attendance
  captureAttendance: (data) => api.post('/attendance/capture', data),
  getDailyAttendance: (params) => api.get('/attendance/daily', { params }),
  getMonthlyAttendance: (params) => api.get('/attendance/monthly', { params }),
  updateAttendance: (id, data) => api.put(`/attendance/${id}`, data),
  getStudentAttendance: (studentId) => api.get(`/attendance/student/${studentId}`),
  syncOfflineAttendance: (data) => api.post('/attendance/sync', data),
  
  // Reports
  generateReport: (type, params) => api.get(`/reports/${type}`, { params }),
  exportReport: (format, data) => api.post('/reports/export', { format, data }),
  
  // AI Service
  detectFaces: (image) => api.post('/ai/detect', { image }),
  recognizeFaces: (image) => api.post('/ai/recognize', { image }),
  encodeFace: (image) => api.post('/ai/encode', { image }),
  
  // Users (for admin)
  getUsers: () => api.get('/users'),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`)
}

// Offline API wrapper
export const offlineApi = {
  storeRequest: (endpoint, data) => {
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_DATA) || '[]')
    requests.push({
      endpoint,
      data,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    })
    localStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(requests))
  },
  
  processQueue: async () => {
    const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_DATA) || '[]')
    const successful = []
    const failed = []
    
    for (const request of requests) {
      try {
        await apiMethods[request.endpoint](request.data)
        successful.push(request.id)
      } catch (error) {
        failed.push({ ...request, error })
      }
    }
    
    // Remove successful requests
    const remaining = requests.filter(req => !successful.includes(req.id))
    localStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(remaining))
    
    return { successful: successful.length, failed: failed.length, failedRequests: failed }
  }
}

export default api
