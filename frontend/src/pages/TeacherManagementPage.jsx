import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Mail,
  Phone,
  Edit,
  Trash2,
  Eye,
  Download
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const TeacherManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  
  // Sample teacher data
  const teachers = [
    { id: 1, name: 'Mrs. Sharma', email: 'sharma@school.edu', phone: '+1234567890', role: 'Class Teacher', classes: ['Class 1A', 'Class 1B'], status: 'active' },
    { id: 2, name: 'Mr. Kumar', email: 'kumar@school.edu', phone: '+1234567891', role: 'Class Teacher', classes: ['Class 2A'], status: 'active' },
    { id: 3, name: 'Ms. Patel', email: 'patel@school.edu', phone: '+1234567892', role: 'Subject Teacher', classes: ['Math', 'Science'], status: 'active' },
    { id: 4, name: 'Mr. Singh', email: 'singh@school.edu', phone: '+1234567893', role: 'Class Teacher', classes: ['Class 3A'], status: 'on-leave' },
    { id: 5, name: 'Mrs. Gupta', email: 'gupta@school.edu', phone: '+1234567894', role: 'Admin', classes: ['Administration'], status: 'active' },
  ];

  // Filter teachers
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || teacher.role === selectedRole;
    return matchesSearch && matchesRole;
  });

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
              Teacher Management
            </h1>
            <p className="text-gray-600 mt-2">Manage teacher profiles, roles, and assignments</p>
          </div>
          <Button variant="primary" icon={Plus}>
            Add New Teacher
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-5 text-center">
          <div className="text-2xl font-bold text-gray-800">5</div>
          <div className="text-sm text-gray-600">Total Teachers</div>
        </Card>
        <Card className="p-5 text-center bg-blue-50">
          <div className="text-2xl font-bold text-blue-600">3</div>
          <div className="text-sm text-gray-600">Class Teachers</div>
        </Card>
        <Card className="p-5 text-center bg-green-50">
          <div className="text-2xl font-bold text-green-600">1</div>
          <div className="text-sm text-gray-600">Subject Teachers</div>
        </Card>
        <Card className="p-5 text-center bg-purple-50">
          <div className="text-2xl font-bold text-purple-600">1</div>
          <div className="text-sm text-gray-600">Admin Staff</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search teachers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              showClear
              onClear={() => setSearchTerm('')}
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Roles</option>
              <option value="Class Teacher">Class Teacher</option>
              <option value="Subject Teacher">Subject Teacher</option>
              <option value="Admin">Admin</option>
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

      {/* Teachers Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Teacher</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Classes/Subjects</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mr-3">
                        <span className="text-white font-medium">
                          {teacher.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{teacher.name}</div>
                        <div className="text-sm text-gray-600">ID: TCH{teacher.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {teacher.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail size={14} className="mr-2 text-gray-500" />
                        {teacher.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone size={14} className="mr-2 text-gray-500" />
                        {teacher.phone}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {teacher.classes.map((cls, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          {cls}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      teacher.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {teacher.status}
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
        {filteredTeachers.length === 0 && (
          <div className="text-center py-12">
            <Users className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-3">Bulk Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full">Send Messages</Button>
            <Button variant="outline" size="sm" className="w-full">Assign Classes</Button>
            <Button variant="outline" size="sm" className="w-full">Update Permissions</Button>
          </div>
        </Card>
        
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-3">Import/Export</h3>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full">Import Teachers</Button>
            <Button variant="outline" size="sm" className="w-full">Export Template</Button>
          </div>
        </Card>
        
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-3">Help</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Class teachers can take attendance</li>
            <li>• Subject teachers can view reports</li>
            <li>• Admin staff have full access</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default TeacherManagementPage;