import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  School, 
  MapPin, 
  Phone, 
  Mail,
  User,
  Calendar,
  Save,
  Upload
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const SchoolSetupPage = () => {
  const [schoolInfo, setSchoolInfo] = useState({
    schoolName: '',
    schoolAddress: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    contactPhone: '',
    contactEmail: '',
    principalName: '',
    establishmentYear: '',
    schoolType: 'primary',
    studentCapacity: '',
    accreditation: '',
  });

  const handleSave = () => {
    // Save school information
    alert('School information saved successfully!');
  };

  const handleChange = (field, value) => {
    setSchoolInfo(prev => ({
      ...prev,
      [field]: value
    }));
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
              <School className="mr-3" size={32} />
              School Setup
            </h1>
            <p className="text-gray-600 mt-2">Configure your school's basic information and settings</p>
          </div>
          <Button variant="primary" icon={Save} onClick={handleSave}>
            Save Information
          </Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* School Logo and Preview */}
        <div className="lg:col-span-1">
          <Card className="p-6 text-center">
            <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <School className="text-gray-400" size={48} />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">School Logo</h3>
            <p className="text-sm text-gray-600 mb-4">Upload your school's logo</p>
            <Button variant="outline" icon={Upload} className="w-full">
              Upload Logo
            </Button>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6 mt-6">
            <h3 className="font-bold text-gray-800 mb-4">School Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium">Not Configured</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium">Never</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Verification</p>
                <p className="font-medium text-yellow-600">Pending</p>
              </div>
            </div>
          </Card>
        </div>

        {/* School Information Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name *
                </label>
                <Input
                  value={schoolInfo.schoolName}
                  onChange={(e) => handleChange('schoolName', e.target.value)}
                  placeholder="Enter school name"
                  icon={School}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Address *
                </label>
                <textarea
                  value={schoolInfo.schoolAddress}
                  onChange={(e) => handleChange('schoolAddress', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                  rows="3"
                  placeholder="Enter complete school address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <Input
                  value={schoolInfo.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Enter city"
                  icon={MapPin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <Input
                  value={schoolInfo.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="Enter state"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pin Code *
                </label>
                <Input
                  value={schoolInfo.pinCode}
                  onChange={(e) => handleChange('pinCode', e.target.value)}
                  placeholder="Enter pin code"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  value={schoolInfo.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                >
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone *
                </label>
                <Input
                  value={schoolInfo.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  placeholder="Enter phone number"
                  icon={Phone}
                  type="tel"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email *
                </label>
                <Input
                  value={schoolInfo.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  placeholder="Enter email address"
                  icon={Mail}
                  type="email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Principal Name *
                </label>
                <Input
                  value={schoolInfo.principalName}
                  onChange={(e) => handleChange('principalName', e.target.value)}
                  placeholder="Enter principal's name"
                  icon={User}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Establishment Year *
                </label>
                <Input
                  value={schoolInfo.establishmentYear}
                  onChange={(e) => handleChange('establishmentYear', e.target.value)}
                  placeholder="Enter year"
                  icon={Calendar}
                  type="number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Type
                </label>
                <select
                  value={schoolInfo.schoolType}
                  onChange={(e) => handleChange('schoolType', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                >
                  <option value="primary">Primary School</option>
                  <option value="middle">Middle School</option>
                  <option value="high">High School</option>
                  <option value="secondary">Secondary School</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Capacity
                </label>
                <Input
                  value={schoolInfo.studentCapacity}
                  onChange={(e) => handleChange('studentCapacity', e.target.value)}
                  placeholder="Enter capacity"
                  type="number"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accreditation
                </label>
                <Input
                  value={schoolInfo.accreditation}
                  onChange={(e) => handleChange('accreditation', e.target.value)}
                  placeholder="Enter accreditation details"
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button variant="primary" icon={Save} onClick={handleSave}>
                Save School Information
              </Button>
            </div>
          </Card>

          {/* Additional Setup Steps */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Setup Checklist</h2>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Basic School Information', completed: false },
                { step: 2, title: 'Add Classes and Sections', completed: false },
                { step: 3, title: 'Register Teachers', completed: false },
                { step: 4, title: 'Add Students', completed: false },
                { step: 5, title: 'Configure Attendance Settings', completed: false },
              ].map((item) => (
                <div key={item.step} className="flex items-center p-3 border rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                    item.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {item.completed ? '✓' : item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                  </div>
                  <Button variant="outline" size="sm">
                    {item.completed ? 'Review' : 'Setup'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SchoolSetupPage;