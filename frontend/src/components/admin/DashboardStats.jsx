import React from 'react';
import { Users, BookOpen, UserCheck, TrendingUp, Calendar, Activity } from 'lucide-react';
import Card from '../common/Card';

const DashboardStats = () => {
  const stats = [
    { 
      title: 'Total Students', 
      value: '256', 
      icon: Users, 
      color: 'bg-blue-500',
      change: '+12%'
    },
    { 
      title: 'Total Classes', 
      value: '12', 
      icon: BookOpen, 
      color: 'bg-green-500',
      change: '+2'
    },
    { 
      title: 'Active Teachers', 
      value: '8', 
      icon: UserCheck, 
      color: 'bg-purple-500',
      change: 'All Active'
    },
    { 
      title: 'Today\'s Attendance', 
      value: '94%', 
      icon: TrendingUp, 
      color: 'bg-yellow-500',
      change: '+3%'
    },
  ];

  const recentActivity = [
    { time: '10:30 AM', activity: 'Class 3 attendance marked', user: 'Teacher Priya' },
    { time: '9:45 AM', action: '2 new students registered', user: 'Teacher Raj' },
    { time: 'Yesterday', activity: 'Monthly report generated', user: 'System' },
    { time: 'Jan 19', activity: 'Class 4 added', user: 'Admin' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <span className="text-sm text-green-600">{stat.change}</span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.title}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <h3 className="font-bold mb-4 flex items-center">
            <Activity className="mr-2" /> Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.map((item, index) => (
              <div key={index} className="flex items-start border-b pb-3 last:border-0">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <Calendar size={18} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.activity}</div>
                  <div className="text-sm text-gray-600">{item.user}</div>
                </div>
                <div className="text-sm text-gray-500">{item.time}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-left">
              View Attendance Reports
            </button>
            <button className="w-full p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-left">
              Add New Student
            </button>
            <button className="w-full p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-left">
              Generate Mid-Day Meal Report
            </button>
            <button className="w-full p-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 text-left">
              System Settings
            </button>
          </div>
        </Card>
      </div>

      {/* Attendance Chart */}
      <Card className="mt-6 p-4">
        <h3 className="font-bold mb-4">Weekly Attendance Trend</h3>
        <div className="flex items-end h-32 gap-2">
          {[80, 85, 90, 92, 94, 96, 95].map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-blue-500 rounded-t-lg"
                style={{ height: `${value}%` }}
              />
              <div className="text-xs mt-1">Day {index + 1}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DashboardStats;