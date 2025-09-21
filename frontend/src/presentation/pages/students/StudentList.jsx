import React, { useEffect, useState, useMemo } from 'react';
import useStudentStore from '../../../application/stores/useStudentStore';
import { StudentTable } from '../../components/students/StudentTable';
import { StudentFilters } from '../../components/students/StudentFilters';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { StudentSummaryReport } from '../../components/reports/StudentSummaryReport';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, GraduationCap, TrendingUp, AlertCircle, CheckCircle, Clock, Activity, FileText } from 'lucide-react';

export const StudentList = () => {
  const {
    students,
    loading,
    error,
    filters,
    fetchStudents,
    searchStudents,
    setFilters,
    updateStudent,
    deleteStudent
  } = useStudentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showMetrics, setShowMetrics] = useState(true);
  const [showSummaryReport, setShowSummaryReport] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents(filters);
  }, [fetchStudents, filters]);

  // Calculate metrics from students data
  const metrics = useMemo(() => {
    if (!students || students.length === 0) {
      return {
        total: 0,
        enrolled: 0,
        pending: 0,
        waiting: 0,
        rejected: 0,
        growthRate: 0,
        enrollmentRate: 0
      };
    }

    const total = students.length;
    const enrolled = students.filter(s =>
      s.enrollments?.[0]?.enrollmentStatus === 'Enrolled' || s.currentEnrollment?.enrollmentStatus === 'Enrolled'
    ).length;
    const pending = students.filter(s =>
      s.enrollments?.[0]?.enrollmentStatus === 'Pending' || s.currentEnrollment?.enrollmentStatus === 'Pending'
    ).length;
    const waiting = students.filter(s =>
      s.enrollments?.[0]?.enrollmentStatus === 'Waiting' || s.currentEnrollment?.enrollmentStatus === 'Waiting'
    ).length;
    const rejected = students.filter(s =>
      s.enrollments?.[0]?.enrollmentStatus === 'Rejected' || s.currentEnrollment?.enrollmentStatus === 'Rejected'
    ).length;

    // Calculate growth rate (mock data for demo)
    const lastMonthTotal = Math.floor(total * 0.92);
    const growthRate = ((total - lastMonthTotal) / lastMonthTotal * 100).toFixed(1);

    // Calculate enrollment rate
    const enrollmentRate = total > 0 ? ((enrolled / total) * 100).toFixed(1) : 0;

    return {
      total,
      enrolled,
      pending,
      waiting,
      rejected,
      growthRate,
      enrollmentRate
    };
  }, [students]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      searchStudents(query);
    } else if (query.length === 0) {
      fetchStudents(filters);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleAddStudent = () => {
    navigate('/students/new');
  };

  const handleEditStudent = (student) => {
    console.log('Editing student:', student);
    navigate(`/students/edit/${student.id}`);
  };

  const handleDeleteStudent = async (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.fullName || student.first_name + ' ' + student.last_name}?`)) {
      const result = await deleteStudent(student.id);
      if (result.success) {
        fetchStudents(filters); // Refresh list after deletion
      } else {
        console.error('Error deleting student:', result.error);
        // Potentially show an error message to the user
      }
    }
  };

  if (loading && students.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-indigo-600" />
                Student Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track all student records and enrollments
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {showMetrics ? 'Hide' : 'Show'} Metrics
              </button>
              <Button
                onClick={() => setShowSummaryReport(true)}
                variant="outline"
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <FileText className="h-5 w-5" />
                Generate Summary
              </Button>
              <Button
                onClick={handleAddStudent}
                variant="primary"
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <UserPlus className="h-5 w-5" />
                Add New Student
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Dashboard */}
        {showMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500">
            {/* Total Students Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.total}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">+{metrics.growthRate}%</span>
                    <span className="text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className="bg-indigo-100 rounded-full p-3">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>

            {/* Enrolled Students Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Enrolled</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{metrics.enrolled}</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Enrollment Rate</span>
                      <span className="font-medium">{metrics.enrollmentRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${metrics.enrollmentRate}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Pending & Waiting Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Process</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{metrics.pending + metrics.waiting}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-gray-600">{metrics.pending} pending</span>
                    </div>
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 text-orange-500 mr-1" />
                      <span className="text-gray-600">{metrics.waiting} waiting</span>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-100 rounded-full p-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="animate-in slide-in-from-top duration-300">
            <ErrorAlert message={error} />
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <StudentFilters
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            searchQuery={searchQuery}
          />
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <StudentTable
            students={students}
            loading={loading}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
            onView={(student) => navigate(`/students/view/${student.id}`)}
          />
        </div>
      </div>

      {/* Summary Report Modal */}
      {showSummaryReport && (
        <StudentSummaryReport
          students={students}
          metrics={metrics}
          onClose={() => setShowSummaryReport(false)}
        />
      )}
    </div>
  );
};