// API Endpoints
export const API_BASE_URL = 'https://deepseek-backend.onrender.com/api';
export const AI_SERVICE_URL = 'https://deepseek-ai.onrender.com';

// Roles
export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher'
}

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused'
}

// Face Recognition Threshold
export const FACE_RECOGNITION_THRESHOLD = 0.6

// Local Storage Keys (AsyncStorage)
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  OFFLINE_DATA: 'attendance_offline',
  SETTINGS: 'attendance_settings'
}

// Classes (1-12)
export const CLASSES = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)

// Sections
export const SECTIONS = ['A', 'B', 'C', 'D', 'E']

// Genders
export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
]

// Recognition Modes
export const RECOGNITION_MODES = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  HYBRID: 'hybrid'
}
