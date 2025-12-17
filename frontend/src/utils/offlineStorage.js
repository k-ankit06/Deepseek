import { STORAGE_KEYS } from '../constants'

// Initialize offline storage
export const initOfflineStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.OFFLINE_DATA)) {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify([]))
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
      offlineMode: true,
      autoSync: true,
      syncInterval: 300000, // 5 minutes
      lastSync: null
    }))
  }
}

// Store data offline
export const storeOffline = (key, data) => {
  try {
    const offlineData = JSON.parse(localStorage.getItem(key) || '{}')
    offlineData[Date.now()] = data
    localStorage.setItem(key, JSON.stringify(offlineData))
    return true
  } catch (error) {
    console.error('Failed to store offline data:', error)
    return false
  }
}

// Retrieve offline data
export const getOfflineData = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error('Failed to retrieve offline data:', error)
    return {}
  }
}

// Queue API request for offline processing
export const queueRequest = (method, endpoint, data) => {
  const queue = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_DATA) || '[]')
  
  const request = {
    id: generateRequestId(),
    method,
    endpoint,
    data,
    timestamp: Date.now(),
    attempts: 0,
    status: 'pending'
  }
  
  queue.push(request)
  localStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(queue))
  
  return request.id
}

// Process queued requests
export const processQueue = async (api) => {
  const queue = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_DATA) || '[]')
  const pending = queue.filter(req => req.status === 'pending')
  
  const results = {
    success: 0,
    failed: 0,
    errors: []
  }
  
  for (const request of pending) {
    try {
      // Prevent infinite retries
      if (request.attempts >= 3) {
        request.status = 'failed'
        results.failed++
        continue
      }
      
      // Execute the request
      const response = await api({
        method: request.method,
        url: request.endpoint,
        data: request.data
      })
      
      request.status = 'completed'
      request.completedAt = Date.now()
      request.response = response
      results.success++
      
    } catch (error) {
      request.attempts++
      request.lastError = error.message
      results.failed++
      results.errors.push({
        requestId: request.id,
        error: error.message
      })
    }
  }
  
  // Update queue
  const updatedQueue = queue.filter(req => req.status === 'pending')
  localStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(updatedQueue))
  
  // Update sync settings
  const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}')
  settings.lastSync = Date.now()
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  
  return results
}

// Store attendance data offline
export const storeAttendanceOffline = (attendanceData) => {
  const key = `attendance_${Date.now()}`
  return storeOffline(key, attendanceData)
}

// Store student data offline
export const storeStudentOffline = (studentData) => {
  const key = `student_${Date.now()}`
  return storeOffline(key, studentData)
}

// Check if data should be stored offline
export const shouldStoreOffline = () => {
  const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}')
  return settings.offlineMode === true
}

// Get offline storage stats
export const getStorageStats = () => {
  let totalSize = 0
  let itemCount = 0
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith('attendance_') || key.startsWith('student_') || key === STORAGE_KEYS.OFFLINE_DATA) {
      const value = localStorage.getItem(key)
      totalSize += new Blob([value]).size
      itemCount++
    }
  }
  
  return {
    totalSize,
    itemCount,
    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
  }
}

// Clear old offline data
export const cleanupOldData = (maxAgeDays = 7) => {
  const maxAge = maxAgeDays * 24 * 60 * 60 * 1000
  const now = Date.now()
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    
    if (key.startsWith('attendance_') || key.startsWith('student_')) {
      try {
        const timestamp = parseInt(key.split('_')[1])
        if (now - timestamp > maxAge) {
          localStorage.removeItem(key)
        }
      } catch (error) {
        // Ignore keys that don't match the pattern
      }
    }
  }
  
  // Clean up completed requests from queue
  const queue = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_DATA) || '[]')
  const activeQueue = queue.filter(req => {
    if (req.status === 'completed') {
      return now - req.completedAt < maxAge
    }
    return true
  })
  
  localStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(activeQueue))
}

// Generate unique request ID
const generateRequestId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Export all offline storage functions
export default {
  initOfflineStorage,
  storeOffline,
  getOfflineData,
  queueRequest,
  processQueue,
  storeAttendanceOffline,
  storeStudentOffline,
  shouldStoreOffline,
  getStorageStats,
  cleanupOldData
}