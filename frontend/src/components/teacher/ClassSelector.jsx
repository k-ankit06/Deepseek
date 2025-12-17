import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Filter,
  Search,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'
import Input from '../common/Input'
import { apiMethods } from '../../utils/api'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const ClassSelector = ({ onSelectClass, showActions = true }) => {
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [filteredClasses, setFilteredClasses] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({})

  // Load classes and stats
  useEffect(() => {
    loadClasses()
    loadStats()
  }, [])

  // Filter classes based on search
  useEffect(() => {
    if (searchQuery) {
      const filtered = classes.filter(cls =>
        cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.teacher.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredClasses(filtered)
    } else {
      setFilteredClasses(classes)
    }
  }, [searchQuery, classes])

  const loadClasses = async () => {
    setIsLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800))

      const mockClasses = [
        {
          id: 'class-1',
          name: 'Class 1',
          section: 'A',
          teacher: 'Ms. Priya Sharma',
          totalStudents: 42,
          presentToday: 38,
          attendanceRate: 90.5,
          lastAttendance: '2024-01-20',
          color: 'from-blue-500 to-cyan-500'
        },
        {
          id: 'class-2',
          name: 'Class 2',
          section: 'B',
          teacher: 'Mr. Raj Kumar',
          totalStudents: 45,
          presentToday: 42,
          attendanceRate: 93.3,
          lastAttendance: '2024-01-20',
          color: 'from-green-500 to-emerald-500'
        },
        {
          id: 'class-3',
          name: 'Class 3',
          section: 'A',
          teacher: 'Ms. Anjali Mehta',
          totalStudents: 38,
          presentToday: 35,
          attendanceRate: 92.1,
          lastAttendance: '2024-01-20',
          color: 'from-purple-500 to-violet-500'
        },
        {
          id: 'class-4',
          name: 'Class 4',
          section: 'C',
          teacher: 'Mr. Suresh Patel',
          totalStudents: 40,
          presentToday: 36,
          attendanceRate: 90.0,
          lastAttendance: '2024-01-20',
          color: 'from-orange-500 to-amber-500'
        },
        {
          id: 'class-5',
          name: 'Class 5',
          section: 'A',
          teacher: 'Ms. Kavita Singh',
          totalStudents: 48,
          presentToday: 45,
          attendanceRate: 93.8,
          lastAttendance: '2024-01-20',
          color: 'from-pink-500 to-rose-500'
        },
        {
          id: 'class-6',
          name: 'Class 6',
          section: 'B',
          teacher: 'Mr. Amit Verma',
          totalStudents: 35,
          presentToday: 32,
          attendanceRate: 91.4,
          lastAttendance: '2024-01-20',
          color: 'from-indigo-500 to-blue-500'
        }
      ]

      setClasses(mockClasses)
      setFilteredClasses(mockClasses)
    } catch (error) {
      toast.error('Failed to load classes')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Mock stats
      const mockStats = {
        totalClasses: 6,
        totalStudents: 248,
        averageAttendance: 91.8,
        todaysAttendance: 228,
        pendingClasses: 1
      }

      setStats(mockStats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleClassSelect = (cls) => {
    setSelectedClass(cls)
    if (onSelectClass) {
      onSelectClass(cls)
    }
  }

  const handleTakeAttendance = () => {
    if (selectedClass) {
      navigate('/attendance/capture', {
        state: {
          class: selectedClass.name,
          section: selectedClass.section
        }
      })
    } else {
      toast.error('Please select a class first')
    }
  }

  const handleViewDetails = () => {
    if (selectedClass) {
      navigate(`/ teacher / class/ ${selectedClass.id} `)
    } else {
      toast.error('Please select a class first')
    }
  }

  const ClassCard = ({ cls }) => (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        hoverable
        clickable
        onClick={() => handleClassSelect(cls)}
        className={`border - 2 ${selectedClass?.id === cls.id
            ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
            : 'border-gray-200 dark:border-gray-700'
          } `}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center mb-2">
              <div className={`w - 10 h - 10 rounded - lg bg - gradient - to - br ${cls.color} flex items - center justify - center mr - 3`}>
                <BookOpen className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {cls.name} - Section {cls.section}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {cls.teacher}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Students
                </div>
                <div className="flex items-center">
                  <Users className="text-gray-400 mr-1" size={16} />
                  <span className="font-semibold">{cls.totalStudents}</span>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Present Today
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-1" size={16} />
                  <span className="font-semibold text-green-600">{cls.presentToday}</span>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Attendance Rate
                </div>
                <div className="flex items-center">
                  <TrendingUp className="text-blue-500 mr-1" size={16} />
                  <span className="font-semibold">{cls.attendanceRate}%</span>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Last Updated
                </div>
                <div className="flex items-center">
                  <Clock className="text-gray-400 mr-1" size={16} />
                  <span className="font-semibold">Today</span>
                </div>
              </div>
            </div>
          </div>

          <ChevronRight className={`${selectedClass?.id === cls.id
              ? 'text-primary-500'
              : 'text-gray-400'
            } `} size={20} />
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Attendance</span>
            <span className="font-medium">{cls.attendanceRate}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${cls.attendanceRate}% ` }}
              transition={{ duration: 1 }}
              className={`h - full bg - gradient - to - r ${cls.color} `}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  )

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title flex items-center">
          <BookOpen className="mr-3" size={32} />
          My Classes
        </h1>
        <p className="page-subtitle">
          Select a class to manage attendance, view students, or generate reports
        </p>
      </div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
      >
        <Card className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.totalClasses || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Classes</div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.totalStudents || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Students</div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
            {stats.todaysAttendance || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Today's Attendance</div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {stats.averageAttendance || 0}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Attendance</div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
            {stats.pendingClasses || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending Classes</div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Classes List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card>
            {/* Search and Filter */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search classes by name or teacher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={Search}
                    showClear
                    onClear={() => setSearchQuery('')}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    icon={Filter}
                    onClick={() => {/* Implement filter modal */ }}
                  >
                    Filter
                  </Button>

                  <Button
                    variant="ghost"
                    icon={RefreshCw}
                    onClick={loadClasses}
                    loading={isLoading}
                  >
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Classes Grid */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl loading-shimmer" />
                ))}
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="text-center py-12">
                <Search className="text-gray-400 mx-auto mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No classes found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery ? 'Try a different search term' : 'No classes assigned yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredClasses.map(cls => (
                  <ClassCard key={cls.id} cls={cls} />
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Right Column - Actions & Selected Class */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Selected Class Info */}
          {selectedClass ? (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📋 Selected Class
              </h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className={`w - 12 h - 12 rounded - xl bg - gradient - to - br ${selectedClass.color} flex items - center justify - center mr - 3`}>
                    <BookOpen className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedClass.name} - Section {selectedClass.section}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedClass.teacher}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Students</span>
                    <span className="font-semibold">{selectedClass.totalStudents}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Present Today</span>
                    <span className="font-semibold text-green-600">{selectedClass.presentToday}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Absent Today</span>
                    <span className="font-semibold text-red-600">
                      {selectedClass.totalStudents - selectedClass.presentToday}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Attendance Rate</span>
                    <span className="font-semibold">{selectedClass.attendanceRate}%</span>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Today's Attendance</span>
                    <span className="font-medium">{selectedClass.attendanceRate}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h - full bg - gradient - to - r ${selectedClass.color} `}
                      style={{ width: `${selectedClass.attendanceRate}% ` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-8">
                <BookOpen className="text-gray-400 mx-auto mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Class Selected
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Select a class from the list to view details and take actions
                </p>
              </div>
            </Card>
          )}

          {/* Quick Actions */}
          {showActions && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                ⚡ Quick Actions
              </h3>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  icon={Calendar}
                  onClick={handleTakeAttendance}
                  disabled={!selectedClass}
                  fullWidth
                >
                  Take Attendance
                </Button>

                <Button
                  variant="outline"
                  icon={Users}
                  onClick={handleViewDetails}
                  disabled={!selectedClass}
                  fullWidth
                >
                  View Class Details
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate('/attendance/verification')}
                  fullWidth
                >
                  Verify Attendance
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => navigate('/reports')}
                  fullWidth
                >
                  Generate Reports
                </Button>
              </div>
            </Card>
          )}

          {/* Tips Card */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💡 Quick Tips
            </h3>

            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={14} />
                <span>Take attendance at the beginning of each class</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={14} />
                <span>Verify attendance before final submission</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={14} />
                <span>Generate weekly reports for parents</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={14} />
                <span>Contact admin for class transfers</span>
              </li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default ClassSelector