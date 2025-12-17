import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  Users, 
  TrendingUp, 
  Camera,
  BookOpen,
  Bell,
  Clock,
  CheckCircle,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../components/auth/ProtectedRoute';
import { ClassSelector } from '../components/teacher';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState(null);

  // Stats data
  const stats = [
    { title: 'Total Students', value: '42', icon: Users, color: 'blue', change: '+2' },
    { title: 'Today Present', value: '38', icon: CheckCircle, color: 'green', change: '94%' },
    { title: 'Classes Today', value: '3', icon: BookOpen, color: 'purple', change: 'All Done' },
    { title: 'Pending Tasks', value: '2', icon: Bell, color: 'orange', change: '-1' },
  ];

  // Today's schedule
  const todaysSchedule = [
    { time: '09:00 AM', class: 'Class 1 - A', subject: 'Mathematics', status: 'completed' },
    { time: '10:30 AM', class: 'Class 2 - B', subject: 'Science', status: 'upcoming' },
    { time: '12:00 PM', class: 'Class 3 - A', subject: 'English', status: 'upcoming' },
    { time: '02:00 PM', class: 'Class 4 - C', subject: 'Social Studies', status: 'later' },
  ];

  // Quick actions
  const quickActions = [
    { title: 'Take Attendance', icon: Camera, color: 'from-blue-500 to-cyan-500', path: '/attendance' },
    { title: 'View Reports', icon: BarChart3, color: 'from-green-500 to-emerald-500', path: '/reports' },
    { title: 'Message Parents', icon: MessageSquare, color: 'from-purple-500 to-pink-500', path: '/messages' },
    { title: 'View Schedule', icon: Calendar, color: 'from-orange-500 to-amber-500', path: '/schedule' },
  ];

  // Recent attendance
  const recentAttendance = [
    { class: 'Class 1 - A', date: 'Today', present: 38, absent: 4, rate: '90%' },
    { class: 'Class 2 - B', date: 'Yesterday', present: 40, absent: 2, rate: '95%' },
    { class: 'Class 3 - A', date: 'Jan 19', present: 35, absent: 5, rate: '88%' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mr-4">
              <User className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || 'Teacher'}! 👋</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" icon={Bell}>Notifications</Button>
            <Button variant="primary" icon={Camera} onClick={() => window.location.href = '/attendance'}>
              Take Attendance
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-5 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                  <stat.icon className={`text-${stat.color}-600`} size={22} />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-600 mt-1">{stat.title}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`bg-gradient-to-br ${action.color} rounded-2xl p-5 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all`}
                  onClick={() => window.location.href = action.path}
                >
                  <action.icon size={24} className="mb-3" />
                  <h3 className="font-semibold text-lg">{action.title}</h3>
                  <p className="text-white/80 text-sm mt-2">Click to get started</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Clock className="mr-2" size={20} />
                Today's Schedule
              </h2>
              <span className="text-sm text-gray-500">Updated now</span>
            </div>
            
            <div className="space-y-4">
              {todaysSchedule.map((item, index) => (
                <div key={index} className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-3 h-3 rounded-full mt-2 mr-3 ${
                    item.status === 'completed' ? 'bg-green-500' :
                    item.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-400'
                  }`}></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{item.class}</div>
                    <div className="text-sm text-gray-600">{item.subject}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{item.time}</div>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Attendance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Attendance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Class</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Present</th>
                  <th className="p-3 text-left">Absent</th>
                  <th className="p-3 text-left">Rate</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((record, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{record.class}</td>
                    <td className="p-3">{record.date}</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <CheckCircle className="text-green-500 mr-2" size={16} />
                        {record.present}
                      </div>
                    </td>
                    <td className="p-3">{record.absent}</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: record.rate }}
                          />
                        </div>
                        {record.rate}
                      </div>
                    </td>
                    <td className="p-3">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Class Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ClassSelector 
          onSelectClass={setSelectedClass}
          showActions={true}
        />
      </motion.div>

      {/* Performance Chart */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Card className="p-6">
          <h3 className="font-bold text-gray-800 mb-4">Weekly Performance</h3>
          <div className="h-48 flex items-end gap-2">
            {[85, 88, 90, 92, 94, 95, 93].map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-cyan-300 rounded-t-lg"
                  style={{ height: `${value}%` }}
                />
                <div className="text-xs mt-2">Day {index + 1}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-gray-800 mb-4">Quick Links</h3>
          <div className="space-y-3">
            {[
              { title: 'Student Progress Reports', icon: TrendingUp },
              { title: 'Parent Communication', icon: MessageSquare },
              { title: 'Lesson Plans', icon: BookOpen },
              { title: 'Attendance History', icon: Calendar },
            ].map((link, index) => (
              <button
                key={index}
                className="w-full p-3 flex items-center hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => window.location.href = `/${link.title.toLowerCase().replace(' ', '-')}`}
              >
                <link.icon className="text-blue-600 mr-3" size={20} />
                <span className="font-medium">{link.title}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;