import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Users,
  Edit,
  Trash2,
  Eye,
  Download
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const ClassManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  
  // Sample class data
  const classes = [
    { id: 1, name: 'Class 1', grade: 'Primary', section: 'A', strength: 32, teacher: 'Mrs. Sharma' },
    { id: 2, name: 'Class 1', grade: 'Primary', section: 'B', strength: 28, teacher: 'Mr. Kumar' },
    { id: 3, name: 'Class 2', grade: 'Primary', section: 'A', strength: 35, teacher: 'Ms. Patel' },
    { id: 4, name: 'Class 3', grade: 'Primary', section: 'A', strength: 30, teacher: 'Mr. Singh' },
    { id: 5, name: 'Class 4', grade: 'Primary', section: 'A', strength: 29, teacher: 'Mrs. Gupta' },
    { id: 6, name: 'Class 5', grade: 'Primary', section: 'A', strength: 31, teacher: 'Mr. Reddy' },
  ];

  // Filter classes
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || cls.grade === selectedGrade;
    return matchesSearch && matchesGrade;
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
              <BookOpen className="mr-3" size={32} />
              Class Management
            </h1>
            <p className="text-gray-600 mt-2">Manage classes, sections, and assignments</p>
          </div>
          <Button variant="primary" icon={Plus}>
            Add New Class
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-5 text-center">
          <div className="text-2xl font-bold text-gray-800">6</div>
          <div className="text-sm text-gray-600">Total Classes</div>
        </Card>
        <Card className="p-5 text-center bg-blue-50">
          <div className="text-2xl font-bold text-blue-600">18</div>
          <div className="text-sm text-gray-600">Total Sections</div>
        </Card>
        <Card className="p-5 text-center bg-green-50">
          <div className="text-2xl font-bold text-green-600">185</div>
          <div className="text-sm text-gray-600">Total Students</div>
        </Card>
        <Card className="p-5 text-center bg-purple-50">
          <div className="text-2xl font-bold text-purple-600">6</div>
          <div className="text-sm text-gray-600">Class Teachers</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search classes or teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              showClear
              onClear={() => setSearchTerm('')}
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Grades</option>
              <option value="Primary">Primary</option>
              <option value="Middle">Middle</option>
              <option value="High">High</option>
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

      {/* Classes Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Class</th>
                <th className="p-3 text-left">Grade</th>
                <th className="p-3 text-left">Section</th>
                <th className="p-3 text-left">Strength</th>
                <th className="p-3 text-left">Class Teacher</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((cls) => (
                <tr key={cls.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{cls.name}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {cls.grade}
                    </span>
                  </td>
                  <td className="p-3">{cls.section}</td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <Users className="text-gray-400 mr-2" size={16} />
                      {cls.strength}
                    </div>
                  </td>
                  <td className="p-3">{cls.teacher}</td>
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
        {filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-3">.bulk Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full">Assign Teachers</Button>
            <Button variant="outline" size="sm" className="w-full">Update Timetable</Button>
            <Button variant="outline" size="sm" className="w-full">Generate Reports</Button>
          </div>
        </Card>
        
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-3">Import/Export</h3>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full">Import Classes</Button>
            <Button variant="outline" size="sm" className="w-full">Export Template</Button>
          </div>
        </Card>
        
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-3">Help</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Each class can have multiple sections</li>
            <li>• Assign one class teacher per section</li>
            <li>• Class strength updates automatically</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default ClassManagementPage;