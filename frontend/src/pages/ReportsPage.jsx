import React, { useState, useEffect } from 'react';
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
import BackButton from '../components/common/BackButton';
import { DailyAttendance, MonthlySummary, ReportExporter, StudentHistory } from '../components/reports';
import { apiMethods } from '../utils/api';
import toast from 'react-hot-toast';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportStats, setReportStats] = useState([
    { title: 'Total Reports', value: '0', icon: FileText, color: 'blue' },
    { title: 'Generated Today', value: '0', icon: BarChart3, color: 'green' },
    { title: 'Pending Review', value: '0', icon: Calendar, color: 'orange' },
    { title: 'Avg. Accuracy', value: '0%', icon: TrendingUp, color: 'purple' },
  ]);

  // Fetch real report stats
  useEffect(() => {
    fetchReportStats();
  }, []);

  const fetchReportStats = async () => {
    try {
      // Get today's attendance for stats
      const today = new Date().toISOString().split('T')[0];
      const response = await apiMethods.getDailyAttendance({ date: today });

      if (response.success && response.data) {
        const records = Array.isArray(response.data) ? response.data : [];
        const present = records.filter(r => r.status === 'present').length;
        const total = records.length;
        const accuracy = total > 0 ? Math.round((present / total) * 100) : 0;

        setReportStats([
          { title: 'Total Records', value: total.toString(), icon: FileText, color: 'blue' },
          { title: 'Present Today', value: present.toString(), icon: BarChart3, color: 'green' },
          { title: 'Absent Today', value: (total - present).toString(), icon: Calendar, color: 'orange' },
          { title: 'Attendance Rate', value: `${accuracy}%`, icon: TrendingUp, color: 'purple' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching report stats:', error);
    }
  };

  // Export attendance data as CSV
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Create CSV headers
    const headers = ['Date', 'Student Name', 'Roll Number', 'Class', 'Status', 'Time'];

    // Create CSV rows
    const rows = data.map(record => [
      record.date || new Date().toLocaleDateString(),
      record.student?.firstName ? `${record.student.firstName} ${record.student.lastName || ''}` : 'N/A',
      record.student?.rollNumber || 'N/A',
      record.class?.name || record.class?.grade || 'N/A',
      record.status || 'N/A',
      record.time || record.createdAt ? new Date(record.createdAt).toLocaleTimeString() : 'N/A'
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`✅ Report exported: ${filename}.csv`);
  };

  // Generate and download report
  const handleGenerateReport = async () => {
    toast.loading('Generating report...', { id: 'generate-report' });
    try {
      const response = await apiMethods.getDailyAttendance({
        startDate: dateRange.start,
        endDate: dateRange.end
      });

      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        if (data.length === 0) {
          toast.error('No attendance records found for selected date range', { id: 'generate-report' });
          return;
        }
        exportToCSV(data, `attendance_report_${dateRange.start}_to_${dateRange.end}`);
        toast.success('Report generated!', { id: 'generate-report' });
      } else {
        toast.error('Failed to fetch attendance data', { id: 'generate-report' });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report', { id: 'generate-report' });
    }
  };

  // Export all reports
  const handleExportAllReports = async () => {
    toast.loading('Exporting all attendance records...', { id: 'export-all' });
    try {
      // Fetch all attendance data (last 30 days)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await apiMethods.getDailyAttendance({
        startDate,
        endDate
      });

      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        if (data.length === 0) {
          toast.error('No attendance records found', { id: 'export-all' });
          return;
        }
        exportToCSV(data, 'all_attendance_reports');
        toast.success('All records exported!', { id: 'export-all' });
      } else {
        toast.error('Failed to fetch attendance data', { id: 'export-all' });
      }
    } catch (error) {
      console.error('Error exporting reports:', error);
      toast.error('Failed to export reports', { id: 'export-all' });
    }
  };

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
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <BarChart3 className="mr-3" size={32} />
                Reports & Analytics
              </h1>
              <p className="text-gray-600 mt-2">Generate and analyze attendance reports</p>
            </div>
          </div>
          <Button variant="primary" icon={Download} onClick={handleExportAllReports}>
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
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" icon={Filter} onClick={() => toast.success('Filters applied')}>
              Apply Filters
            </Button>
            <Button variant="primary" icon={Download} onClick={handleGenerateReport}>
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-6 py-3 font-medium border-b-2 transition-all ${activeTab === 'daily'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
        >
          <Calendar className="inline mr-2" size={18} />
          Daily Attendance
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-6 py-3 font-medium border-b-2 transition-all ${activeTab === 'monthly'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
        >
          <PieChart className="inline mr-2" size={18} />
          Monthly Summary
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`px-6 py-3 font-medium border-b-2 transition-all ${activeTab === 'student'
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