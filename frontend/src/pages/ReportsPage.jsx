import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Download, 
  Filter, 
  Calendar,
  FileText,
  PieChart,
  TrendingUp,
  Eye
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { DailyAttendance, MonthlySummary, ReportExporter, StudentHistory } from '../components/reports';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Report stats
  const reportStats = [
    { title: 'Total Reports', value: '24', icon: FileText, color: 'blue' },
    { title: 'Generated Today', value: '3', icon: BarChart3, color: 'green' },
    { title: 'Pending Review', value: '2', icon: Calendar, color: 'orange' },
    { title: 'Avg. Accuracy', value: '98%', icon: TrendingUp, color: 'purple' },
  ];

  // Report templates
  const reportTemplates = [
    { name: 'Daily Attendance', description: 'Attendance report for a specific day', icon: Calendar },
    { name: 'Monthly Summary', description: 'Comprehensive monthly attendance statistics', icon: PieChart },
    { name: 'Student History', description: 'Individual student attendance history', icon: FileText },
    { name: 'Class Performance', description: 'Class-wise attendance comparison', icon: BarChart3 },
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
              <BarChart3 className="mr-3" size={32} />
              Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-2">Generate and analyze attendance reports</p>
          </div>
          <Button variant="primary" icon={Download}>
            Export All Reports
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {reportStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-5 text-center">
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center mx-auto mb-3`}>
                <stat.icon className={`text-${stat.color}-600`} size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Report Templates */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {reportTemplates.map((template, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="p-5 text-center cursor-pointer hover-lift"
              onClick={() => setActiveTab(template.name.toLowerCase().replace(' ', '-').split('-')[0])}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <template.icon className="text-blue-600" size={24} />
              </div>
              <h3 className="font-bold text-gray-800">{template.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" icon={Filter}>
              Apply Filters
            </Button>
            <Button variant="primary" icon={Download}>
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-6 py-3 font-medium border-b-2 transition-all ${
            activeTab === 'daily'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="inline mr-2" size={18} />
          Daily Attendance
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-6 py-3 font-medium border-b-2 transition-all ${
            activeTab === 'monthly'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <PieChart className="inline mr-2" size={18} />
          Monthly Summary
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`px-6 py-3 font-medium border-b-2 transition-all ${
            activeTab === 'student'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="inline mr-2" size={18} />
          Student History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'daily' && <DailyAttendance />}
      {activeTab === 'monthly' && <MonthlySummary />}
      {activeTab === 'student' && <StudentHistory />}

      {/* Report Exporter */}
      <ReportExporter />
    </div>
  );
};

export default ReportsPage;