import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Camera, 
  Upload, 
  Save,
  Calendar,
  Users,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import CameraCapture from '../components/common/CameraCapture';

const StudentRegistrationPage = () => {
  const [studentInfo, setStudentInfo] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    class: '',
    section: '',
    fatherName: '',
    motherName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    city: '',
    pinCode: '',
  });
  
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleSave = () => {
    // Save student information
    alert('Student registered successfully!');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (imageData) => {
    setPhotoPreview(imageData);
    setShowCamera(false);
  };

  const handleChange = (field, value) => {
    setStudentInfo(prev => ({
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
              <UserPlus className="mr-3" size={32} />
              Student Registration
            </h1>
            <p className="text-gray-600 mt-2">Register new students in the system</p>
          </div>
          <Button variant="primary" icon={Save} onClick={handleSave}>
            Register Student
          </Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Photo Section */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="font-bold text-gray-800 mb-4 text-center">Student Photo</h3>
            
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 rounded-xl bg-gray-100 flex items-center justify-center mb-4 overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <UserPlus className="text-gray-400" size={48} />
                )}
              </div>
              
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  icon={Camera} 
                  className="flex-1"
                  onClick={() => setShowCamera(true)}
                >
                  Camera
                </Button>
                <label className="flex-1">
                  <Button variant="outline" icon={Upload} className="w-full">
                    Upload
                  </Button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                Photo helps with face recognition for attendance
              </p>
            </div>
          </Card>

          {/* Registration Stats */}
          <Card className="p-6 mt-6">
            <h3 className="font-bold text-gray-800 mb-4">Registration Info</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Today's Registrations</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold">142</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">1,248</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Registration Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Student Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <Input
                  value={studentInfo.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <Input
                  value={studentInfo.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <Input
                  value={studentInfo.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  placeholder="YYYY-MM-DD"
                  icon={Calendar}
                  type="date"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  value={studentInfo.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class *
                </label>
                <select
                  value={studentInfo.class}
                  onChange={(e) => handleChange('class', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                >
                  <option value="">Select class</option>
                  <option value="1">Class 1</option>
                  <option value="2">Class 2</option>
                  <option value="3">Class 3</option>
                  <option value="4">Class 4</option>
                  <option value="5">Class 5</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section *
                </label>
                <select
                  value={studentInfo.section}
                  onChange={(e) => handleChange('section', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                >
                  <option value="">Select section</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father's Name *
                </label>
                <Input
                  value={studentInfo.fatherName}
                  onChange={(e) => handleChange('fatherName', e.target.value)}
                  placeholder="Enter father's name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mother's Name *
                </label>
                <Input
                  value={studentInfo.motherName}
                  onChange={(e) => handleChange('motherName', e.target.value)}
                  placeholder="Enter mother's name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Phone *
                </label>
                <Input
                  value={studentInfo.parentPhone}
                  onChange={(e) => handleChange('parentPhone', e.target.value)}
                  placeholder="Enter phone number"
                  icon={Phone}
                  type="tel"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Email
                </label>
                <Input
                  value={studentInfo.parentEmail}
                  onChange={(e) => handleChange('parentEmail', e.target.value)}
                  placeholder="Enter email address"
                  icon={Mail}
                  type="email"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  value={studentInfo.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                  rows="3"
                  placeholder="Enter complete address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <Input
                  value={studentInfo.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Enter city"
                  icon={MapPin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pin Code *
                </label>
                <Input
                  value={studentInfo.pinCode}
                  onChange={(e) => handleChange('pinCode', e.target.value)}
                  placeholder="Enter pin code"
                  type="number"
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button variant="primary" icon={Save} onClick={handleSave}>
                Register Student
              </Button>
            </div>
          </Card>

          {/* Bulk Registration */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Bulk Registration</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Register multiple students</p>
                <p className="text-sm text-gray-600">Upload CSV file with student details</p>
              </div>
              <Button variant="outline" icon={Upload}>
                Upload CSV
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Camera Capture Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <CameraCapture onCapture={handleCameraCapture} onCancel={() => setShowCamera(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRegistrationPage;