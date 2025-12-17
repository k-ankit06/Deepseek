import React, { useState } from 'react';
import { User, Calendar, TrendingUp } from 'lucide-react';
import Card from '../common/Card';
import Input from '../common/Input';

const StudentHistory = () => {
  const [studentId, setStudentId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sample student history
  const studentHistory = [
    { date: '2024-01-01', status: 'present', class: 'Class 1', teacher: 'Teacher A' },
    { date: '2024-01-02', status: 'present', class: 'Class 1', teacher: 'Teacher A' },
    { date: '2024-01-03', status: 'absent', class: 'Class 1', teacher: 'Teacher A' },
    { date: '2024-01-04', status: 'present', class: 'Class 1', teacher: 'Teacher A' },
    { date: '2024-01-05', status: 'present', class: 'Class 1', teacher: 'Teacher A' },
  ];

  const stats = {
    totalDays: studentHistory.length,
    presentDays: studentHistory.filter(d => d.status === 'present').length,
    absentDays: studentHistory.filter(d => d.status === 'absent').length,
    attendanceRate: Math.round((studentHistory.filter(d => d.status === 'present').length / studentHistory.length) * 100)
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Student Attendance History</h1>
        <p className="text-gray-600">Track individual student attendance records</p>
      </div>

      {/* Search Form */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Student ID</label>
            <Input
              placeholder="Enter Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              icon={User}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              icon={Calendar}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              icon={Calendar}
            />
          </div>
        </div>
        <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Search
        </button>
      </Card>

      {/* Student Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold">{stats.totalDays}</div>
          <div className="text-sm text-gray-600">Total Days</div>
        </Card>
        <Card className="text-center p-4 bg-green-50">
          <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
          <div className="text-sm text-gray-600">Present</div>
        </Card>
        <Card className="text-center p-4 bg-red-50">
          <div className="text-2xl font-bold text-red-600">{stats.absentDays}</div>
          <div className="text-sm text-gray-600">Absent</div>
        </Card>
        <Card className="text-center p-4 bg-blue-50">
          <div className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</div>
          <div className="text-sm text-gray-600">Attendance Rate</div>
        </Card>
      </div>

      {/* Student Info */}
      <Card className="mb-6 p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={32} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Ramesh Kumar</h3>
            <p className="text-gray-600">Student ID: STU001 | Class: Class 1 | Roll No: 1</p>
          </div>
        </div>
      </Card>

      {/* Attendance History */}
      <Card>
        <h3 className="font-bold mb-4 flex items-center">
          <TrendingUp className="mr-2" /> Attendance History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Class</th>
                <th className="p-3 text-left">Teacher</th>
              </tr>
            </thead>
            <tbody>
              {studentHistory.map((record, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{record.date}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full ${
                      record.status === 'present' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="p-3">{record.class}</td>
                  <td className="p-3">{record.teacher}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StudentHistory;