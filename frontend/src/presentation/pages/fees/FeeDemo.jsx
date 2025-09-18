import React, { useState } from 'react';
import {
  Eye,
  ArrowRight,
  DollarSign,
  Settings,
  CreditCard,
  FileText,
  Play,
  Monitor
} from 'lucide-react';

// Import all fee components
import FeeDashboard from './FeeDashboard';
import FeeStructure from './FeeStructure';
import PaymentProcessing from './PaymentProcessing';
import PaymentHistory from './PaymentHistory';

const FeeDemo = () => {
  const [activeDemo, setActiveDemo] = useState('overview');

  const demoPages = [
    {
      id: 'dashboard',
      title: 'Fee Dashboard',
      description: 'Overview of collections, pending amounts, and financial metrics',
      icon: DollarSign,
      color: 'green',
      component: FeeDashboard
    },
    {
      id: 'structure',
      title: 'Fee Structure Management',
      description: 'Configure fee structures for different classes and categories',
      icon: Settings,
      color: 'purple',
      component: FeeStructure
    },
    {
      id: 'payments',
      title: 'Payment Processing',
      description: 'Process student payments with multiple payment methods',
      icon: CreditCard,
      color: 'blue',
      component: PaymentProcessing
    },
    {
      id: 'history',
      title: 'Payment History & Reports',
      description: 'View payment history, generate receipts, and analyze trends',
      icon: FileText,
      color: 'indigo',
      component: PaymentHistory
    }
  ];

  const features = [
    {
      title: 'Real-time Dashboard',
      description: 'Monitor fee collections, pending amounts, and overdue payments in real-time',
      icon: Monitor
    },
    {
      title: 'Flexible Fee Structure',
      description: 'Configure different fee types for various classes with mandatory and optional categories',
      icon: Settings
    },
    {
      title: 'Multi-payment Support',
      description: 'Accept payments via UPI, cards, cash, and QR codes with automated receipt generation',
      icon: CreditCard
    },
    {
      title: 'Advanced Analytics',
      description: 'Track payment trends, success rates, and generate comprehensive financial reports',
      icon: FileText
    }
  ];

  const OverviewPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full mb-6">
            <DollarSign className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Fee Management System</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A comprehensive prototype showcasing modern UI/UX for school fee management,
            payment processing, and financial analytics.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => setActiveDemo('dashboard')}
              className="flex items-center space-x-2 px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 font-medium shadow-lg hover:scale-105"
            >
              <Play className="h-5 w-5" />
              <span>Start Demo</span>
            </button>
            <p className="text-sm text-gray-500">Click on any component below to explore</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <feature.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Demo Components */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Interactive Components</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Click on any component below to see the full interactive prototype in action
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {demoPages.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer transform hover:scale-105"
                onClick={() => setActiveDemo(page.id)}
              >
                <div className={`bg-gradient-to-r from-${page.color}-500 to-${page.color}-600 px-8 py-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <page.icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{page.title}</h3>
                        <p className="text-white/80 text-sm">{page.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-6 w-6 text-white/80" />
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">Click to view prototype</span>
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium">
                      <span>View Demo</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Technical Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Monitor className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Frontend Only</h3>
              <p className="text-sm text-gray-600">Pure React components with mock data for UI/UX demonstration</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Modern UI/UX</h3>
              <p className="text-sm text-gray-600">Tailwind CSS with responsive design and smooth animations</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Ready for Integration</h3>
              <p className="text-sm text-gray-600">Components ready for backend integration when needed</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
            {demoPages.map((page) => (
              <button
                key={page.id}
                onClick={() => setActiveDemo(page.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  activeDemo === page.id
                    ? `bg-${page.color}-100 text-${page.color}-700`
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <page.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{page.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (activeDemo === 'overview') {
    return <OverviewPage />;
  }

  const selectedPage = demoPages.find(page => page.id === activeDemo);
  const DemoComponent = selectedPage?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveDemo('overview')}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              <span>Back to Overview</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <selectedPage.icon className="h-5 w-5 text-indigo-600" />
              <h1 className="font-semibold text-gray-900">{selectedPage.title}</h1>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Demo</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {demoPages.map((page) => (
              <button
                key={page.id}
                onClick={() => setActiveDemo(page.id)}
                className={`p-2 rounded-lg transition-colors ${
                  activeDemo === page.id
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title={page.title}
              >
                <page.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Component */}
      {DemoComponent && <DemoComponent />}
    </div>
  );
};

export default FeeDemo;