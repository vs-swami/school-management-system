import React, { useEffect, useState, useMemo } from 'react';
import useStudentStore from '../../../application/stores/useStudentStore';
import { StudentTable } from '../../components/students/StudentTable';
import { StudentGrid } from '../../components/students/StudentGrid';
import { StudentFilters } from '../../components/students/StudentFilters';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { StudentSummaryReport } from '../../components/reports/StudentSummaryReport';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, GraduationCap, TrendingUp, AlertCircle, CheckCircle, Clock, Activity, FileText, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../../application/stores/useAuthStore';

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

  // Get user role from auth store
  const { user } = useAuthStore();
  const userRole = user?.role?.type || user?.role?.name || user?.role || 'public';
  const username = user?.username || user?.email || 'User';
  const userEmail = user?.email || '';

  // Define roles - check role object first, then fallback to email/username patterns
  const isPrincipal = ['principal', 'administrator', 'admin'].includes(userRole.toLowerCase()) ||
                      userEmail.includes('principal') || username.includes('principal');
  const isClerk = ['admission-clerk', 'admission_clerk', 'clerk', 'admissions'].includes(userRole.toLowerCase()) ||
                   userEmail.includes('clerk') || username.includes('clerk');

  const [searchQuery, setSearchQuery] = useState('');
  const [showMetrics, setShowMetrics] = useState(true);
  const [showSummaryReport, setShowSummaryReport] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    // Apply enrollment status filter for clerks
    let appliedFilters = { ...filters };

    if (isClerk) {
      // Clerks can only see students with "Enquiry" enrollment status
      appliedFilters = {
        ...filters,
        filters: {
          ...filters.filters,
          enrollments: {
            enrollment_status: {
              $eq: 'Enquiry'
            }
          }
        }
      };
    }

    fetchStudents(appliedFilters);
  }, [fetchStudents, filters, isClerk]);

  // Paginated students
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return students.slice(startIndex, endIndex);
  }, [students, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(students.length / itemsPerPage);

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
      // For search, we need to pass the enrollment filter too
      // Note: searchStudents might need to be updated to support filters
      searchStudents(query);
    } else if (query.length === 0) {
      // Apply enrollment status filter for clerks
      let appliedFilters = { ...filters };

      if (isClerk) {
        appliedFilters = {
          ...filters,
          filters: {
            ...filters.filters,
            enrollments: {
              enrollment_status: {
                $eq: 'Enquiry'
              }
            }
          }
        };
      }
      fetchStudents(appliedFilters);
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex justify-between items-center">
                <div>
                  <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
                <div className="flex gap-3">
                  <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
                  <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
                  <div className="h-10 w-36 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                      <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-32 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex gap-4">
                <div className="flex-1 h-10 bg-gray-200 rounded-md"></div>
                <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
                <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
              </div>
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
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
                {isClerk
                  ? 'View and manage student enquiries'
                  : 'Manage and track all student records and enrollments'
                }
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Table View"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="hidden sm:inline">{showMetrics ? 'Hide' : 'Show'} Metrics</span>
                <span className="sm:hidden">Metrics</span>
              </button>
              <Button
                onClick={() => setShowSummaryReport(true)}
                variant="outline"
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <FileText className="h-4 sm:h-5 w-4 sm:w-5" />
                <span className="hidden sm:inline">Generate Summary</span>
                <span className="sm:hidden">Summary</span>
              </Button>
              <Button
                onClick={handleAddStudent}
                variant="primary"
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <UserPlus className="h-4 sm:h-5 w-4 sm:w-5" />
                <span className="hidden sm:inline">Add New Student</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Badge for Clerks */}
        {isClerk && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Filtered View: Showing students with "Enquiry" status only
              </p>
              <p className="text-xs text-blue-700 mt-1">
                As a clerk, you can view and process student enquiries. Enrolled students are managed by principals.
              </p>
            </div>
          </div>
        )}

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

        {/* Student Table/Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {viewMode === 'table' ? (
            <StudentTable
              students={paginatedStudents}
              loading={loading}
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudent}
              onView={(student) => navigate(`/students/view/${student.id}`)}
            />
          ) : (
            <StudentGrid
              students={paginatedStudents}
              loading={loading}
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudent}
              onView={(student) => navigate(`/students/view/${student.id}`)}
            />
          )}

          {/* Pagination Controls */}
          {students.length > itemsPerPage && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, students.length)}
                  </span>{' '}
                  of <span className="font-medium">{students.length}</span> students
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = idx + 1;
                        } else if (currentPage <= 3) {
                          pageNum = idx + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + idx;
                        } else {
                          pageNum = currentPage - 2 + idx;
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? 'bg-indigo-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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