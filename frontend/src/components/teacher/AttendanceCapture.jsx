import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Camera,
  CheckCircle,
  XCircle,
  Users,
  Save,
  AlertCircle,
  Calendar,
  Clock,
  RefreshCw,
  UserCheck,
  UserX,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'
import CameraCapture from '../common/CameraCapture'
import { apiMethods } from '../../utils/api'
import { storeAttendanceOffline, getOfflineData } from '../../utils/offlineStorage'
import toast from 'react-hot-toast'

const AttendanceCapture = () => {
  // Step: 1 = Select Class, 2 = Capture, 3 = Review & Submit
  const [step, setStep] = useState(1)
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedClass, setSelectedClass] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [students, setStudents] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [classes, setClasses] = useState([])
  const [imageConfirmed, setImageConfirmed] = useState(false)

  // Offline mode state
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Monitor network status and auto-sync when back online
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true)
      toast.success('Back online!')

      // Auto-sync offline data when back online
      const { syncOfflineAttendance, getOfflineAttendanceCount } = await import('../../utils/offlineStorage')
      const offlineCount = getOfflineAttendanceCount()

      if (offlineCount > 0) {
        toast.loading(`📤 Auto-syncing ${offlineCount} offline record(s)...`, { id: 'auto-sync' })

        try {
          const result = await syncOfflineAttendance(apiMethods)

          if (result.success) {
            toast.success(`✅ Synced ${result.synced} record(s)!`, { id: 'auto-sync' })
          } else {
            toast.error(`⚠️ Synced ${result.synced}, Failed ${result.failed}`, { id: 'auto-sync' })
          }
        } catch (error) {
          toast.error('❌ Auto-sync failed', { id: 'auto-sync' })
        }
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setIsOfflineMode(true)
      toast.error('You are offline. Switching to offline mode.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Fetch classes on mount
  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    setIsLoading(true)
    try {
      const response = await apiMethods.getClasses()
      if (response.success && response.data) {
        setClasses(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error)
      setClasses([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch students when class is selected
  useEffect(() => {
    if (selectedClassId) {
      fetchStudentsByClass(selectedClassId)
      const cls = classes.find(c => c._id === selectedClassId)
      setSelectedClass(cls)
    }
  }, [selectedClassId, classes])

  const fetchStudentsByClass = async (classId) => {
    try {
      const response = await apiMethods.getStudentsByClass(classId)
      // Handle different response formats
      let studentData = []
      if (response.success && response.data) {
        studentData = Array.isArray(response.data) ? response.data :
          response.data.students ? response.data.students : []
      } else if (Array.isArray(response)) {
        studentData = response
      }

      // Initialize all students as present
      const studentList = studentData.map(s => ({
        ...s,
        status: 'present',
        confidence: 0
      }))
      setStudents(studentList)
    } catch (error) {
      console.error('Failed to fetch students:', error)
      // Try fetching all students as fallback
      try {
        const allStudents = await apiMethods.getStudents()
        let studentData = []
        if (allStudents.success && allStudents.data) {
          studentData = Array.isArray(allStudents.data) ? allStudents.data :
            allStudents.data.students ? allStudents.data.students : []
        }
        const studentList = studentData
          .filter(s => s.class?._id === classId || s.class === classId)
          .map(s => ({
            ...s,
            status: 'present',
            confidence: 0
          }))
        setStudents(studentList)
      } catch (e) {
        setStudents([])
      }
    }
  }

  // Handle camera capture
  const handleCapture = async (data) => {
    if (data?.image) {
      setCapturedImage(data.image.url || data.image)
      setIsCameraOpen(false)
      setImageConfirmed(false) // Reset confirmation when new image captured
    }
  }



  // Confirm image has students
  const handleConfirmImage = async () => {
    if (!imageConfirmed) {
      toast.error('Please confirm that students are visible in the image')
      return
    }
    await processAttendance(capturedImage)
  }

  // Process captured image with AI (or manual mode if offline)
  const processAttendance = async (imageData) => {
    setIsProcessing(true)
    try {
      // Get image as base64 string
      const imageBase64 = typeof imageData === 'string' ? imageData : imageData.url || imageData

      // OFFLINE MODE: Skip AI, go straight to manual attendance
      if (isOfflineMode || !isOnline) {
        toast('📴 Offline Mode: Please mark attendance manually', { icon: 'ℹ️' })

        // All students start as "unknown" - teacher will manually mark
        setStudents(prev => prev.map(s => ({
          ...s,
          status: 'present', // Default to present, teacher can toggle
          confidence: 0
        })))

        setStep(3)
        setIsProcessing(false)
        return
      }

      // ONLINE MODE: Call AI recognition API
      const result = await apiMethods.recognizeAttendance({
        classId: selectedClassId,
        imageData: imageBase64,
        mode: 'online'
      })

      if (result.success && result.data) {
        const recognitions = result.data.recognitions || result.data.recognized || []
        const errors = result.data.errors || []

        // Update students based on recognition results
        setStudents(prev => prev.map(student => {
          // Find if this student was recognized
          const recognition = recognitions.find(r =>
            r.studentId === student._id ||
            r.studentId === student._id?.toString()
          )

          if (recognition) {
            return {
              ...student,
              status: 'present',
              confidence: recognition.confidence || recognition.confidenceScore * 100 || 0
            }
          } else {
            return {
              ...student,
              status: 'absent',
              confidence: 0
            }
          }
        }))

        // Show results
        const presentCount = recognitions.length
        const totalCount = students.length

        if (presentCount > 0) {
          toast.success(`${presentCount} student(s) recognized out of ${totalCount}`)
        } else if (errors.length > 0) {
          toast.error(errors[0])
        } else {
          toast.error('No faces recognized. Please try again with clear image.')
        }

        setStep(3)
      } else {
        // AI service failed - show error
        const errorMsg = result.message || result.error || 'Face recognition failed'
        toast.error(errorMsg)

        // Mark all as absent since recognition failed
        setStudents(prev => prev.map(s => ({
          ...s,
          status: 'absent',
          confidence: 0
        })))
        setStep(3)
      }
    } catch (error) {
      console.error('Recognition error:', error)
      toast.error('Failed to process image: ' + (error.message || 'Please try again'))

      // Mark all as absent on error
      setStudents(prev => prev.map(s => ({
        ...s,
        status: 'absent',
        confidence: 0
      })))
      setStep(3)
    } finally {
      setIsProcessing(false)
    }
  }

  // Toggle student attendance status
  const toggleStudentStatus = (studentId) => {
    setStudents(prev =>
      prev.map(student =>
        student._id === studentId
          ? { ...student, status: student.status === 'present' ? 'absent' : 'present' }
          : student
      )
    )
  }

  // Submit attendance
  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Prepare attendance data
      const attendancePayload = {
        classId: selectedClassId,
        className: selectedClass?.name || `Class ${selectedClass?.grade}`,
        section: selectedClass?.section,
        date: date,
        mode: isOfflineMode || !isOnline ? 'offline' : 'online',
        attendanceData: students.map(s => ({
          studentId: s._id,
          studentName: `${s.firstName} ${s.lastName || ''}`.trim(),
          rollNumber: s.rollNumber,
          status: s.status,
          confidenceScore: s.confidence || 0
        })),
        timestamp: Date.now()
      }

      // OFFLINE MODE: Store locally
      if (isOfflineMode || !isOnline) {
        storeAttendanceOffline(attendancePayload)
        toast.success('📴 Attendance saved offline! Will sync when online.')

        // Reset form
        resetForm()
        return
      }

      // ONLINE MODE: Send to server
      const response = await apiMethods.markAttendance(attendancePayload)

      if (response.success) {
        toast.success('✅ Attendance submitted successfully!')
      } else {
        // If API fails, store offline
        storeAttendanceOffline(attendancePayload)
        toast.success('📴 Saved offline - will sync later')
      }

      // Reset form
      resetForm()
    } catch (error) {
      console.error('Submit error:', error)

      // On error, store offline
      const attendancePayload = {
        classId: selectedClassId,
        className: selectedClass?.name || `Class ${selectedClass?.grade}`,
        section: selectedClass?.section,
        date: date,
        mode: 'offline',
        attendanceData: students.map(s => ({
          studentId: s._id,
          studentName: `${s.firstName} ${s.lastName || ''}`.trim(),
          rollNumber: s.rollNumber,
          status: s.status,
          confidenceScore: s.confidence || 0
        })),
        timestamp: Date.now()
      }
      storeAttendanceOffline(attendancePayload)
      toast.success('📴 Saved offline - will sync when connected')

      resetForm()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form helper
  const resetForm = () => {
    setStep(1)
    setSelectedClassId('')
    setSelectedClass(null)
    setCapturedImage(null)
    setStudents([])
    setImageConfirmed(false)
  }

  const presentCount = students.filter(s => s.status === 'present').length
  const absentCount = students.filter(s => s.status === 'absent').length

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[
            { num: 1, label: 'Select Class' },
            { num: 2, label: 'Capture Photo' },
            { num: 3, label: 'Review & Submit' }
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step >= s.num ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                {step > s.num ? <CheckCircle size={20} /> : s.num}
              </div>
              <span className={`text-sm font-medium ${step >= s.num ? 'text-blue-600' : 'text-gray-500'}`}>
                {s.label}
              </span>
              {i < 2 && <div className={`w-16 h-1 ${step > s.num ? 'bg-blue-500' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step 1: Select Class */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Calendar className="mr-2" size={24} />
                Select Class & Date
              </h2>

              {/* Network Status & Mode Toggle */}
              <div className="flex items-center gap-4">
                {/* Network Status */}
                <div className={`flex items-center px-3 py-1 rounded-full text-sm ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                  {isOnline ? <Wifi size={16} className="mr-1" /> : <WifiOff size={16} className="mr-1" />}
                  {isOnline ? 'Online' : 'Offline'}
                </div>

                {/* Mode Toggle */}
                <label className="flex items-center cursor-pointer">
                  <span className="mr-2 text-sm font-medium text-gray-700">
                    {isOfflineMode ? '📴 Offline Mode' : '🌐 Online Mode'}
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isOfflineMode}
                      onChange={(e) => {
                        setIsOfflineMode(e.target.checked)
                        if (e.target.checked) {
                          toast('Offline mode enabled - AI recognition disabled', { icon: '📴' })
                        } else {
                          toast.success('Online mode - AI recognition enabled')
                        }
                      }}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${isOfflineMode ? 'bg-orange-500' : 'bg-blue-500'
                      }`}></div>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isOfflineMode ? 'translate-x-4' : ''
                      }`}></div>
                  </div>
                </label>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="animate-spin mx-auto text-blue-500 mb-4" size={48} />
                <p className="text-gray-600">Loading classes...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Class *
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                  >
                    <option value="">Choose a class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name || `Class ${cls.grade}`} - Section {cls.section}
                      </option>
                    ))}
                  </select>
                  {classes.length === 0 && (
                    <p className="text-yellow-600 text-sm mt-2">
                      No classes found. Admin needs to create classes first.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            )}

            {selectedClass && students.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800">
                  <strong>{selectedClass.name || `Class ${selectedClass.grade}`} - {selectedClass.section}</strong> has <strong>{students.length} students</strong>
                </p>
              </div>
            )}

            {selectedClass && students.length === 0 && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <p className="text-yellow-800">
                  <AlertCircle className="inline mr-2" size={16} />
                  No students in this class. Add students first.
                </p>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <Button
                variant="primary"
                icon={Camera}
                onClick={() => setStep(2)}
                disabled={!selectedClassId || students.length === 0}
              >
                Next: Capture Photo
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Step 2: Capture Photo */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Camera className="mr-2" size={24} />
              Capture Classroom Photo
            </h2>

            <div className="text-center">
              {!capturedImage && !isProcessing && (
                <>
                  <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                    <div className="text-center">
                      <Camera className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600">Click button below to open camera</p>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      icon={Camera}
                      onClick={() => setIsCameraOpen(true)}
                    >
                      Open Camera
                    </Button>
                  </div>
                </>
              )}

              {isProcessing && (
                <div className="py-12">
                  <RefreshCw className="animate-spin mx-auto text-blue-500 mb-4" size={48} />
                  <p className="text-gray-600">Processing image with AI...</p>
                  <p className="text-sm text-gray-500 mt-2">Recognizing faces...</p>
                </div>
              )}

              {capturedImage && !isProcessing && (
                <div>
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="max-w-full h-64 object-contain mx-auto rounded-lg mb-4"
                  />

                  {/* Confirmation Checkbox */}
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={imageConfirmed}
                        onChange={(e) => setImageConfirmed(e.target.checked)}
                        className="w-5 h-5 text-blue-600 mr-3"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        ✓ I confirm that students are clearly visible in this image
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      icon={RefreshCw}
                      onClick={() => {
                        setCapturedImage(null)
                        setImageConfirmed(false)
                        setIsCameraOpen(true)
                      }}
                    >
                      Retake Photo
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleConfirmImage}
                      disabled={!imageConfirmed}
                    >
                      Confirm & Process
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Camera Modal */}
          {isCameraOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-2xl w-full overflow-hidden">
                <CameraCapture
                  onCapture={handleCapture}
                  onClose={() => setIsCameraOpen(false)}
                  mode="photo"
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4 text-center">
              <Users className="mx-auto text-blue-500 mb-2" size={24} />
              <div className="text-2xl font-bold">{students.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </Card>
            <Card className="p-4 text-center bg-green-50">
              <UserCheck className="mx-auto text-green-500 mb-2" size={24} />
              <div className="text-2xl font-bold text-green-600">{presentCount}</div>
              <div className="text-sm text-gray-600">Present</div>
            </Card>
            <Card className="p-4 text-center bg-red-50">
              <UserX className="mx-auto text-red-500 mb-2" size={24} />
              <div className="text-2xl font-bold text-red-600">{absentCount}</div>
              <div className="text-sm text-gray-600">Absent</div>
            </Card>
          </div>

          {/* Student List */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Review Attendance
              </h2>
              <span className="text-sm text-gray-500">
                {selectedClass?.name || 'Class'} - {selectedClass?.section} | {date}
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {students.map((student) => (
                <div
                  key={student._id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors cursor-pointer ${student.status === 'present'
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                    }`}
                  onClick={() => toggleStudentStatus(student._id)}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${student.status === 'present' ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                      {student.status === 'present' ? (
                        <CheckCircle className="text-white" size={20} />
                      ) : (
                        <XCircle className="text-white" size={20} />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        Roll: {student.rollNumber}
                        {student.confidence > 0 && (
                          <span className="ml-2 text-green-600">
                            ({Math.round(student.confidence)}% confidence)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${student.status === 'present'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {student.status === 'present' ? 'Present' : 'Absent'}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                💡 Click on a student to toggle between Present/Absent
              </p>
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setStep(2)
                  setCapturedImage(null)
                }}
              >
                Back
              </Button>
              <Button
                variant="primary"
                icon={isSubmitting ? Loader2 : Save}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default AttendanceCapture