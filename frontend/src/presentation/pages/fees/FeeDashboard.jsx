import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Download,
  Plus,
  Eye,
  Edit,
  Receipt,
  Building,
  GraduationCap,
  FileText
} from 'lucide-react';

const FeeDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedClass, setSelectedClass] = useState('all');

  // Mock data for prototype
  const dashboardStats = {
    totalCollected: 2450000,
    pendingAmount: 340000,
    overdueAmount: 125000,
    totalStudents: 450,
    paidStudents: 380,
    pendingStudents: 70,
    monthlyGrowth: 12.5,
    collectionRate: 84.4
  };

  const recentPayments = [
    {
      id: 1,
      studentName: 'Arjun Sharma',
      grNo: 'GR2024001',
      class: '10-A',
      amount: 15000,
      type: 'Annual Fee',
      status: 'completed',
      date: '2024-01-15',
      method: 'online'
    },
    {
      id: 2,
      studentName: 'Priya Patel',
      grNo: 'GR2024002',
      class: '8-B',
      amount: 8500,
      type: 'Transport Fee',
      status: 'completed',
      date: '2024-01-15',
      method: 'cash'
    },
    {
      id: 3,
      studentName: 'Rohit Kumar',
      grNo: 'GR2024003',
      class: '12-A',
      amount: 12000,
      type: 'Exam Fee',
      status: 'pending',
      date: '2024-01-14',
      method: 'online'
    }
  ];

  const upcomingDueDates = [
    {
      type: 'Annual Fee',
      dueDate: '2024-03-31',
      studentsAffected: 450,
      totalAmount: 6750000
    },
    {
      type: 'Transport Fee',
      dueDate: '2024-02-15',
      studentsAffected: 180,
      totalAmount: 1530000
    },
    {
      type: 'Exam Fee',
      dueDate: '2024-04-10',
      studentsAffected: 350,
      totalAmount: 1400000
    }
  ];

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue', subtitle }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 bg-${color}-100 rounded-xl`}>
              <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="text-sm font-medium">{trendValue}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const PaymentRow = ({ payment }) => (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
          <span className="font-bold text-indigo-600 text-sm">
            {payment.studentName.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-900">{payment.studentName}</p>
          <p className="text-sm text-gray-500">{payment.grNo} • {payment.class}</p>
        </div>
      </div>
      <div className="text-center">
        <p className="font-medium text-gray-900">{payment.type}</p>
        <p className="text-sm text-gray-500">₹{payment.amount.toLocaleString()}</p>
      </div>
      <div className="text-center">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          payment.status === 'completed'
            ? 'bg-green-100 text-green-800'
            : payment.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {payment.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
          {payment.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
          {payment.status}
        </span>
        <p className="text-sm text-gray-500 mt-1">{payment.method}</p>
      </div>
      <div className="flex items-center space-x-2">
        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
          <Eye className="h-4 w-4" />
        </button>
        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
          <Receipt className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
            <p className="text-gray-600 mt-1">Manage student fees, payments, and financial records</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Plus className="h-4 w-4" />
              <span>New Payment</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Collected"
            value={`₹${(dashboardStats.totalCollected / 100000).toFixed(1)}L`}
            icon={DollarSign}
            trend="up"
            trendValue={dashboardStats.monthlyGrowth}
            color="green"
            subtitle="This month"
          />
          <StatCard
            title="Pending Amount"
            value={`₹${(dashboardStats.pendingAmount / 100000).toFixed(1)}L`}
            icon={Clock}
            color="yellow"
            subtitle={`${dashboardStats.pendingStudents} students`}
          />
          <StatCard
            title="Overdue Amount"
            value={`₹${(dashboardStats.overdueAmount / 100000).toFixed(1)}L`}
            icon={AlertCircle}
            color="red"
            subtitle="Requires attention"
          />
          <StatCard
            title="Collection Rate"
            value={`${dashboardStats.collectionRate}%`}
            icon={TrendingUp}
            trend="up"
            trendValue="2.3"
            color="indigo"
            subtitle="Performance metric"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Payments */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <CreditCard className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Filter className="h-4 w-4" />
                      <span className="text-sm">Filter</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Download className="h-4 w-4" />
                      <span className="text-sm">Export</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  {recentPayments.map((payment) => (
                    <PaymentRow key={payment.id} payment={payment} />
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                    View All Payments →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Due Dates */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Due Dates</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {upcomingDueDates.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.type}</p>
                      <p className="text-sm text-gray-500">{item.studentsAffected} students</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(item.dueDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{(item.totalAmount / 100000).toFixed(1)}L
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <Building className="h-5 w-5 text-indigo-600" />
                  <span className="font-medium text-gray-700">Fee Structure Setup</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <Receipt className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-700">Generate Receipts</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-gray-700">Payment Reports</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-gray-700">Overdue Notices</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Fee Categories Overview */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Fee Categories Overview</h3>
              </div>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Classes</option>
                <option value="10">Class 10</option>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </select>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: 'Annual Fee', amount: 450000, collected: 380000, color: 'blue' },
                { name: 'Transport Fee', amount: 180000, collected: 155000, color: 'green' },
                { name: 'Exam Fee', amount: 125000, collected: 98000, color: 'purple' },
                { name: 'Lab Fee', amount: 75000, collected: 62000, color: 'orange' },
                { name: 'Sports Fee', amount: 45000, collected: 38000, color: 'red' },
                { name: 'Library Fee', amount: 35000, collected: 31000, color: 'indigo' }
              ].map((category, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4">
                  <div className="text-center">
                    <p className="font-medium text-gray-900 text-sm">{category.name}</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      ₹{(category.collected / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-gray-500">
                      of ₹{(category.amount / 1000).toFixed(0)}K
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className={`bg-${category.color}-500 h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${(category.collected / category.amount) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs font-medium text-gray-600 mt-1">
                      {Math.round((category.collected / category.amount) * 100)}% collected
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeDashboard;