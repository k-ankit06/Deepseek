import React, { useState } from 'react';
import { Download, FileText, PieChart, Users, Calendar } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';
import { apiMethods } from '../../utils/api';

const ReportExporter = () => {
  const [reportType, setReportType] = useState('daily');
  const [format, setFormat] = useState('pdf');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const reportTypes = [
    { id: 'daily', name: 'Daily Report', icon: Calendar },
    { id: 'monthly', name: 'Monthly Summary', icon: PieChart },
    { id: 'student', name: 'Student Report', icon: Users },
    { id: 'midday', name: 'Mid-Day Meal', icon: FileText },
  ];

  const handleExport = async () => {
    toast.loading('Generating report...', { id: 'export' });

    try {
      const response = await apiMethods.getDailyAttendance({ date });

      if (response?.data && response.data.length > 0) {
        const headers = ['Date', 'Student Name', 'Roll Number', 'Status', 'Time'];
        const rows = response.data.map(record => [
          date,
          record.student?.firstName + ' ' + (record.student?.lastName || ''),
          record.student?.rollNumber || '',
          record.status,
          record.markedAt ? new Date(record.markedAt).toLocaleTimeString() : ''
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${date}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success(`✅ ${reportType} report downloaded as CSV!`, { id: 'export' });
      } else {
        toast.error('No data found for selected date', { id: 'export' });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to generate report', { id: 'export' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Export Reports</h1>
        <p className="text-gray-600">Generate and download attendance reports</p>
      </div>

      <Card className="p-6">
        {/* Report Type */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Report Type</h3>
          <div className="grid grid-cols-2 gap-3">
            {reportTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`p-4 border-2 rounded-lg text-left ${reportType === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <type.icon className="mb-2" />
                <div className="font-medium">{type.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Selection */}
        <div className="mb-6">
          <label className="block font-medium mb-2">Date Range</label>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm mb-1">From</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">To</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <label className="block font-medium mb-3">Export Format</label>
          <div className="flex gap-3">
            {['pdf', 'excel', 'csv'].map(fmt => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`px-4 py-2 border rounded-lg ${format === fmt
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Class Selection */}
        <div className="mb-6">
          <label className="block font-medium mb-2">Class (Optional)</label>
          <select className="w-full p-2 border rounded-lg">
            <option value="">All Classes</option>
            {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'].map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          icon={Download}
          className="w-full"
        >
          Generate & Download Report
        </Button>
      </Card>

      {/* Quick Export Tips */}
      <Card className="mt-6 p-4">
        <h3 className="font-medium mb-2">Quick Tips:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Daily reports are best for individual day records</li>
          <li>• Monthly summaries show trends over time</li>
          <li>• PDF format for printing, Excel for data analysis</li>
          <li>• Reports include student names, dates, and status</li>
        </ul>
      </Card>
    </div>
  );
};

export default ReportExporter;