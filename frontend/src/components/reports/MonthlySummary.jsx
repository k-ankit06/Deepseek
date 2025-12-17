import React from 'react';
import { TrendingUp, Calendar, Download } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const MonthlySummary = () => {
  // Sample monthly data
  const monthlyData = [
    { month: 'Jan', present: 95, absent: 5, rate: 95 },
    { month: 'Feb', present: 92, absent: 8, rate: 92 },
    { month: 'Mar', present: 94, absent: 6, rate: 94 },
    { month: 'Apr', present: 96, absent: 4, rate: 96 },
    { month: 'May', present: 93, absent: 7, rate: 93 },
    { month: 'Jun', present: 95, absent: 5, rate: 95 },
  ];

  const handleExport = () => {
    alert('Monthly report downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Monthly Summary</h1>
        <p className="text-gray-600">Monthly attendance overview and trends</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <select className="p-2 border rounded-lg">
            <option>January 2024</option>
            <option>February 2024</option>
            <option>March 2024</option>
          </select>
          <select className="p-2 border rounded-lg">
            <option>Class 1</option>
            <option>Class 2</option>
            <option>Class 3</option>
          </select>
        </div>
        <Button onClick={handleExport} icon={Download}>
          Export
        </Button>
      </div>

      {/* Chart */}
      <Card className="mb-6 p-6">
        <h3 className="font-bold mb-4 flex items-center">
          <TrendingUp className="mr-2" /> Attendance Trend
        </h3>
        <div className="h-64 flex items-end gap-2">
          {monthlyData.map((month, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-blue-500 rounded-t-lg"
                style={{ height: `${month.rate}%` }}
              />
              <div className="text-sm mt-2">{month.month}</div>
              <div className="text-xs text-gray-600">{month.rate}%</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Monthly Table */}
      <Card>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Month</th>
              <th className="p-3 text-left">Present Days</th>
              <th className="p-3 text-left">Absent Days</th>
              <th className="p-3 text-left">Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((month, index) => (
              <tr key={index} className="border-t">
                <td className="p-3">{month.month}</td>
                <td className="p-3">{month.present}</td>
                <td className="p-3">{month.absent}</td>
                <td className="p-3">
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${month.rate}%` }}
                      />
                    </div>
                    {month.rate}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default MonthlySummary;