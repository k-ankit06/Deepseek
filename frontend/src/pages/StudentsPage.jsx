import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Phone,
  BookOpen,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import BackButton from '../components/common/BackButton';
import { apiMethods } from '../utils/api';
import toast from 'react-hot-toast';

const StudentsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    classes: 0,
    faceRegistered: 0
  });

  // Fetch students and classes on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch students
      const studentsResponse = await apiMethods.getStudents();
      if (studentsResponse.success && studentsResponse.data) {
        const studentList = studentsResponse.data.students || studentsResponse.data || [];
        setStudents(studentList);

        // Calculate stats
        setStats({
          total: studentList.length,
          active: studentList.filter(s => s.isActive !== false).length,
          classes: [...new Set(studentList.map(s => s.class?._id || s.class))].length,
          faceRegistered: studentList.filter(s => s.faceRegistered).length
        });
      }

      // Fetch classes
      const classesResponse = await apiMethods.getClasses();
      if (classesResponse.success && classesResponse.data) {
        setClasses(classesResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Set empty arrays on error - no fake data
      setStudents([]);
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      (student.rollNumber || '').toString().includes(searchTerm);
    const matchesClass = selectedClass === 'all' ||
      (student.class?._id === selectedClass) ||
      (student.class === selectedClass);
    return matchesSearch && matchesClass;
  });

  // Delete student
  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      const response = await apiMethods.deleteStudent(studentId);
      if (response.success) {
        toast.success('Student deleted successfully');
        fetchData(); // Refresh list
      }
    } catch (error) {
      toast.error('Failed to delete student');
    }
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
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Users className="mr-3" size={32} />
                Student Management
              </h1>
              <p className="text-gray-600 mt-2">Manage all student records and information</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={fetchData}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              icon={UserPlus}
              onClick={() => navigate('/student-registration')}
            >
              Add New Student
            </Button>
          </div>
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
          <div className="text-2xl font-bold text-purple-600">{stats.faceRegistered}</div>
          <div className="text-sm text-gray-600">Face Registered</div>
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
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>
                  {cls.name || `Class ${cls.grade}`} - {cls.section}
                </option>
              ))}
            </select>
            <Button variant="outline" icon={Download} onClick={() => toast.success('Exporting student list...')}>
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <Card className="p-12 text-center">
          <Loader2 className="animate-spin mx-auto text-blue-500 mb-4" size={48} />
          <p className="text-gray-600">Loading students...</p>
        </Card>
      ) : (
        <>
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
                    <th className="p-3 text-left">Face Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{student.rollNumber}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mr-3">
                            <span className="text-white font-medium">
                              {(student.firstName || 'S').charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {student.gender}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <BookOpen className="text-gray-400 mr-2" size={16} />
                          {student.class?.name || student.class?.grade || 'N/A'} - {student.class?.section || student.section || 'N/A'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center text-sm">
                          <Phone size={14} className="mr-2 text-gray-500" />
                          {student.parentPhone || 'N/A'}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${student.faceRegistered
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {student.faceRegistered ? 'Registered' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View Details"
                            onClick={() => toast.success(`Viewing details for ${student.firstName}`)}
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Edit"
                            onClick={() => toast.success(`Editing ${student.firstName}`)}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                            onClick={() => handleDelete(student._id)}
                          >
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
                <AlertCircle className="text-gray-400 mx-auto mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-600 mb-4">
                  {students.length === 0
                    ? 'No students registered yet. Add your first student!'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {students.length === 0 && (
                  <Button
                    variant="primary"
                    icon={UserPlus}
                    onClick={() => navigate('/student-registration')}
                  >
                    Register First Student
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Footer Info */}
          <div className="mt-6 text-sm text-gray-600 text-center">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </>
      )}
    </div>
  );
};

export default StudentsPage;