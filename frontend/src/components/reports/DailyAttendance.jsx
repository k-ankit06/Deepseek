import React, { useState } from 'react';
import { Calendar, Download, Users, CheckCircle, XCircle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const DailyAttendance = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('Class 1');

  // Sample data
  const attendanceData = [
    { id: 1, name: 'Ramesh Kumar', roll: 1, status: 'present', time: '9:00 AM' },
    { id: 2, name: 'Sita Devi', roll: 2, status: 'present', time: '9:01 AM' },
    { id: 3, name: 'Ajay Singh', roll: 3, status: 'absent', time: '-' },
    { id: 4, name: 'Priya Sharma', roll: 4, status: 'present', time: '9:02 AM' },
  ];

  const stats = {
    total: attendanceData.length,
    present: attendanceData.filter(s => s.status === 'present').length,
    absent: attendanceData.filter(s => s.status === 'absent').length,
    rate: Math.round((attendanceData.filter(s => s.status === 'present').length / attendanceData.length) * 100)
  };

  const handleExport = () => {
    alert('Report downloaded successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Daily Attendance Report</h1>
        <p className="text-gray-600">View and export daily attendance records</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'].map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleExport} icon={Download}>
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Students</div>
        </Card>
        <Card className="text-center p-4 bg-green-50">
          <div className="text-2xl font-bold text-green-600">{stats.present}</div>
          <div className="text-sm text-gray-600">Present</div>
        </Card>
        <Card className="text-center p-4 bg-red-50">
          <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
          <div className="text-sm text-gray-600">Absent</div>
        </Card>
        <Card className="text-center p-4 bg-blue-50">
          <div className="text-2xl font-bold text-blue-600">{stats.rate}%</div>
          <div className="text-sm text-gray-600">Attendance Rate</div>
        </Card>
      </div>

      {/* Attendance List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Roll No</th>
                <th className="p-3 text-left">Student Name</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map(student => (
                <tr key={student.id} className="border-t">
                  <td className="p-3">{student.roll}</td>
                  <td className="p-3">{student.name}</td>
                  <td className="p-3">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full ${
                      student.status === 'present' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status === 'present' ? (
                        <CheckCircle size={14} className="mr-1" />
                      ) : (
                        <XCircle size={14} className="mr-1" />
                      )}
                      {student.status}
                    </div>
                  </td>
                  <td className="p-3">{student.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DailyAttendance;