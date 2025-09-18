import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  GraduationCap,
  Bus,
  BookOpen,
  Beaker,
  Trophy,
  Building,
  Calendar,
  Users,
  Settings,
  Copy,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

const FeeStructure = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Mock data for prototype
  const classFeeStructure = [
    {
      id: 1,
      className: 'Class 10',
      academicYear: '2024-25',
      fees: [
        { type: 'Annual Fee', amount: 15000, mandatory: true, dueDate: '31-03-2024' },
        { type: 'Transport Fee', amount: 8500, mandatory: false, dueDate: '15-02-2024' },
        { type: 'Exam Fee', amount: 3500, mandatory: true, dueDate: '10-04-2024' },
        { type: 'Lab Fee', amount: 2500, mandatory: true, dueDate: '31-03-2024' },
        { type: 'Sports Fee', amount: 1500, mandatory: false, dueDate: '30-04-2024' }
      ],
      totalStudents: 45,
      status: 'active'
    },
    {
      id: 2,
      className: 'Class 11',
      academicYear: '2024-25',
      fees: [
        { type: 'Annual Fee', amount: 18000, mandatory: true, dueDate: '31-03-2024' },
        { type: 'Transport Fee', amount: 8500, mandatory: false, dueDate: '15-02-2024' },
        { type: 'Exam Fee', amount: 4000, mandatory: true, dueDate: '10-04-2024' },
        { type: 'Lab Fee', amount: 3500, mandatory: true, dueDate: '31-03-2024' },
        { type: 'Sports Fee', amount: 1500, mandatory: false, dueDate: '30-04-2024' }
      ],
      totalStudents: 52,
      status: 'active'
    },
    {
      id: 3,
      className: 'Class 12',
      academicYear: '2024-25',
      fees: [
        { type: 'Annual Fee', amount: 20000, mandatory: true, dueDate: '31-03-2024' },
        { type: 'Transport Fee', amount: 8500, mandatory: false, dueDate: '15-02-2024' },
        { type: 'Exam Fee', amount: 5000, mandatory: true, dueDate: '10-04-2024' },
        { type: 'Lab Fee', amount: 4000, mandatory: true, dueDate: '31-03-2024' },
        { type: 'Sports Fee', amount: 1500, mandatory: false, dueDate: '30-04-2024' }
      ],
      totalStudents: 38,
      status: 'active'
    }
  ];

  const feeCategories = [
    {
      id: 1,
      name: 'Annual Fee',
      icon: GraduationCap,
      description: 'Academic year tuition fee',
      defaultAmount: 15000,
      color: 'blue',
      applicableTo: 'All Classes'
    },
    {
      id: 2,
      name: 'Transport Fee',
      icon: Bus,
      description: 'School bus transportation',
      defaultAmount: 8500,
      color: 'green',
      applicableTo: 'Optional'
    },
    {
      id: 3,
      name: 'Exam Fee',
      icon: BookOpen,
      description: 'Examination and assessment',
      defaultAmount: 3500,
      color: 'purple',
      applicableTo: 'All Classes'
    },
    {
      id: 4,
      name: 'Lab Fee',
      icon: Beaker,
      description: 'Science laboratory usage',
      defaultAmount: 2500,
      color: 'orange',
      applicableTo: 'Science Classes'
    },
    {
      id: 5,
      name: 'Sports Fee',
      icon: Trophy,
      description: 'Sports facilities and activities',
      defaultAmount: 1500,
      color: 'red',
      applicableTo: 'Optional'
    },
    {
      id: 6,
      name: 'Library Fee',
      icon: Building,
      description: 'Library books and resources',
      defaultAmount: 1000,
      color: 'indigo',
      applicableTo: 'All Classes'
    }
  ];

  const FeeCard = ({ classData }) => {
    const totalMandatory = classData.fees.filter(f => f.mandatory).reduce((sum, f) => sum + f.amount, 0);
    const totalOptional = classData.fees.filter(f => !f.mandatory).reduce((sum, f) => sum + f.amount, 0);

    return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{classData.className}</h3>
                <p className="text-indigo-100 text-sm">{classData.academicYear} • {classData.totalStudents} students</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setEditingItem(classData)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white">
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Mandatory</span>
              </div>
              <p className="text-2xl font-bold text-green-900">₹{totalMandatory.toLocaleString()}</p>
              <p className="text-sm text-green-700">{classData.fees.filter(f => f.mandatory).length} fees</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Optional</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">₹{totalOptional.toLocaleString()}</p>
              <p className="text-sm text-blue-700">{classData.fees.filter(f => !f.mandatory).length} fees</p>
            </div>
          </div>

          <div className="space-y-3">
            {classData.fees.map((fee, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 ${fee.mandatory ? 'bg-green-100' : 'bg-blue-100'} rounded-lg`}>
                    <DollarSign className={`h-4 w-4 ${fee.mandatory ? 'text-green-600' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{fee.type}</p>
                    <p className="text-sm text-gray-500">Due: {fee.dueDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{fee.amount.toLocaleString()}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    fee.mandatory ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {fee.mandatory ? 'Mandatory' : 'Optional'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Total Maximum</span>
              <span className="text-2xl font-bold text-indigo-600">
                ₹{(totalMandatory + totalOptional).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CategoryCard = ({ category }) => {
    const IconComponent = category.icon;
    return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 bg-${category.color}-100 rounded-xl`}>
                <IconComponent className={`h-6 w-6 text-${category.color}-600`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <Edit className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Default Amount</span>
              <span className="font-bold text-gray-900">₹{category.defaultAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Applicable To</span>
              <span className="text-sm text-gray-600">{category.applicableTo}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors">
              <Settings className="h-4 w-4" />
              <span className="font-medium">Configure Rules</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fee Structure Management</h1>
            <p className="text-gray-600 mt-1">Configure and manage fee structures for different classes and categories</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add New</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('classes')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'classes'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span className="font-medium">Class Fee Structure</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'categories'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span className="font-medium">Fee Categories</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Classes</p>
                    <p className="text-2xl font-bold text-gray-900">{classFeeStructure.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Annual Fee</p>
                    <p className="text-2xl font-bold text-gray-900">₹17.7K</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Academic Year</p>
                    <p className="text-2xl font-bold text-gray-900">2024-25</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">135</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Class Fee Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {classFeeStructure.map((classData) => (
                <FeeCard key={classData.id} classData={classData} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Category Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Settings className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Fee Categories Overview</h3>
                    <p className="text-sm text-gray-600">Manage different types of fees and their configurations</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {feeCategories.length} Active Categories
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="text-center">
                    <p className="text-sm font-medium text-blue-900">Mandatory Fees</p>
                    <p className="text-2xl font-bold text-blue-900">4</p>
                    <p className="text-xs text-blue-700">Required for all students</p>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-900">Optional Fees</p>
                    <p className="text-2xl font-bold text-green-900">2</p>
                    <p className="text-xs text-green-700">Student choice based</p>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="text-center">
                    <p className="text-sm font-medium text-purple-900">Total Categories</p>
                    <p className="text-2xl font-bold text-purple-900">{feeCategories.length}</p>
                    <p className="text-xs text-purple-700">Configured fee types</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {feeCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeStructure;