import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  BookOpen
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const StudentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  // Sample students data
  const students = [
    { id: 1, name: 'Ramesh Kumar', roll: 1, class: 'Class 1', section: 'A', phone: '9876543210', status: 'active' },
    { id: 2, name: 'Sita Devi', roll: 2, class: 'Class 1', section: 'A', phone: '9876543211', status: 'active' },
    { id: 3, name: 'Ajay Singh', roll: 3, class: 'Class 2', section: 'B', phone: '9876543212', status: 'inactive' },
    { id: 4, name: 'Priya Sharma', roll: 4, class: 'Class 1', section: 'A', phone: '9876543213', status: 'active' },
    { id: 5, name: 'Raj Kumar', roll: 5, class: 'Class 3', section: 'C', phone: '9876543214', status: 'active' },
  ];

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.roll.toString().includes(searchTerm);
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Statistics
  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    classes: [...new Set(students.map(s => s.class))].length,
    sections: [...new Set(students.map(s => s.section))].length,
  };

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
              <Users className="mr-3" size={32} />
              Student Management
            </h1>
            <p className="text-gray-600 mt-2">Manage all student records and information</p>
          </div>
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => window.location.href = '/students/register'}
          >
            Add New Student
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center p-5">
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Students</div>
        </Card>
        <Card className="text-center p-5 bg-green-50">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active Students</div>
        </Card>
        <Card className="text-center p-5 bg-blue-50">
          <div className="text-2xl font-bold text-blue-600">{stats.classes}</div>
          <div className="text-sm text-gray-600">Classes</div>
        </Card>
        <Card className="text-center p-5 bg-purple-50">
          <div className="text-2xl font-bold text-purple-600">{stats.sections}</div>
          <div className="text-sm text-gray-600">Sections</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              showClear
              onClear={() => setSearchTerm('')}
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Classes</option>
              <option value="Class 1">Class 1</option>
              <option value="Class 2">Class 2</option>
              <option value="Class 3">Class 3</option>
            </select>
            <Button variant="outline" icon={Filter}>
              Filter
            </Button>
            <Button variant="outline" icon={Download}>
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Students Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Roll No</th>
                <th className="p-3 text-left">Student Name</th>
                <th className="p-3 text-left">Class & Section</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{student.roll}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mr-3">
                        <span className="text-white font-medium">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-600">ID: STU{student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <BookOpen className="text-gray-400 mr-2" size={16} />
                      {student.class} - {student.section}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Phone size={14} className="mr-2 text-gray-500" />
                        {student.phone}
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail size={14} className="mr-2 text-gray-500" />
                        student{student.id}@school.com
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      student.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </Card>

      {/* Bulk Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="space-y-2">
          <h3 className="font-medium">Bulk Actions</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Export All</Button>
            <Button variant="outline" size="sm">Send Message</Button>
            <Button variant="outline" size="sm">Print List</Button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {/* Quick Tips */}
      <Card className="mt-6 p-4">
        <h3 className="font-medium mb-2">💡 Quick Tips:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Click on student name to view detailed profile</li>
          <li>• Use bulk export for parent meetings</li>
          <li>• Update student photos for better face recognition</li>
          <li>• Contact admin for bulk student registration</li>
        </ul>
      </Card>
    </div>
  );
};

export default StudentsPage;