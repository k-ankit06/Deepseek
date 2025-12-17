import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Camera, 
  Users, 
  CheckCircle, 
  XCircle,
  Download,
  Filter,
  Clock,
  TrendingUp
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { AttendanceCapture, AttendanceVerification } from '../components/teacher';

const AttendancePage = () => {
  const [activeTab, setActiveTab] = useState('capture');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Attendance stats
  const attendanceStats = {
    today: { total: 256, present: 240, absent: 16, rate: 94 },
    week: { total: 1280, present: 1200, absent: 80, rate: 94 },
    month: { total: 5120, present: 4850, absent: 270, rate: 95 },
  };

  // Recent attendance
  const recentAttendance = [
    { class: 'Class 1 - A', time: '09:00 AM', present: 38, absent: 4, status: 'completed' },
    { class: 'Class 2 - B', time: '10:30 AM', present: 42, absent: 3, status: 'completed' },
    { class: 'Class 3 - A', time: '12:00 PM', present: 35, absent: 5, status: 'pending' },
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
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <Calendar className="mr-3" size={32} />
              Attendance Management
            </h1>
            <p className="text-gray-600 mt-2">Capture, verify, and manage student attendance</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" icon={Download}>
              Export
            </Button>
            <Button variant="primary" icon={Camera} onClick={() => window.location.href = '/attendance/capture'}>
              Take Attendance
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('capture')}
          className={`px-6 py-3 font-medium border-b-2 transition-all ${
            activeTab === 'capture'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Camera className="inline mr-2" size={18} />
          Capture Attendance
        </button>
        <button
          onClick={() => setActiveTab('verification')}
          className={`px-6 py-3 font-medium border-b-2 transition-all ${
            activeTab === 'verification'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <CheckCircle className="inline mr-2" size={18} />
          Verify Attendance
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-medium border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="inline mr-2" size={18} />
          History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'capture' && <AttendanceCapture />}
      {activeTab === 'verification' && <AttendanceVerification />}
      
      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Date Filter */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Select Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="flex items-end gap-3">
                <Button variant="outline" icon={Filter}>
                  Filter
                </Button>
                <Button variant="primary" icon={Download}>
                  Download Report
                </Button>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-xl bg-blue-100 mr-4">
                  <Calendar className="text-blue-600" size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{attendanceStats.today.present}</div>
                  <div className="text-sm text-gray-600">Today Present</div>
                </div>
              </div>
              <div className="text-sm text-green-600">+{attendanceStats.today.rate}% rate</div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-xl bg-green-100 mr-4">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{attendanceStats.week.rate}%</div>
                  <div className="text-sm text-gray-600">Weekly Average</div>
                </div>
              </div>
              <div className="text-sm text-green-600">+2% from last week</div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-xl bg-purple-100 mr-4">
                  <Users className="text-purple-600" size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{attendanceStats.month.total}</div>
                  <div className="text-sm text-gray-600">Monthly Total</div>
                </div>
              </div>
              <div className="text-sm text-green-600">+{attendanceStats.month.rate}% overall</div>
            </Card>
          </div>

          {/* Recent Attendance */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Attendance Records</h2>
            <div className="space-y-4">
              {recentAttendance.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-xl ${
                      record.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                    } flex items-center justify-center mr-4`}>
                      {record.status === 'completed' ? (
                        <CheckCircle className="text-green-600" size={24} />
                      ) : (
                        <Clock className="text-yellow-600" size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{record.class}</h3>
                      <p className="text-sm text-gray-600">{record.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{record.present}</div>
                      <div className="text-sm text-gray-600">Present</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{record.absent}</div>
                      <div className="text-sm text-gray-600">Absent</div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        record.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Chart */}
          <Card className="p-6">
            <h3 className="font-bold text-gray-800 mb-4">Monthly Attendance Trend</h3>
            <div className="h-48 flex items-end gap-2">
              {[85, 88, 90, 92, 94, 95, 93, 92, 94, 96, 95, 94].map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-cyan-300 rounded-t-lg"
                    style={{ height: `${value}%` }}
                  />
                  <div className="text-xs mt-2">{index + 1}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Quick Tips */}
      <Card className="mt-6 p-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h4 className="font-medium mb-2">📋 Best Practices:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Take attendance at the beginning of each class</li>
              <li>• Ensure good lighting for face recognition</li>
              <li>• Verify attendance before final submission</li>
              <li>• Export weekly reports for parents</li>
            </ul>
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-2">⚡ Quick Actions:</h4>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">View Daily Report</Button>
              <Button size="sm" variant="outline">Print Attendance</Button>
              <Button size="sm" variant="outline">Message Parents</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AttendancePage;