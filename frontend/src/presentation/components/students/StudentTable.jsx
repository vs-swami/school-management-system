import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Eye, Edit, Trash2, ChevronUp, ChevronDown, Users, Search, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentTable = ({ students = [], loading = false, onEdit, onDelete, onView }) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [animateRows, setAnimateRows] = useState(false);

  useEffect(() => {
    setAnimateRows(true);
  }, [students]);

  // Sort students
  const sortedStudents = [...students].sort((a, b) => {
    let aValue, bValue;
    
    if (sortField === 'name') {
      aValue = a.fullName ? a.fullName.toLowerCase() : '';
      bValue = b.fullName ? b.fullName.toLowerCase() : '';
    } else if (sortField === 'studentId') {
      aValue = a.ssa_uid || a.apaar_id || '';
      bValue = b.ssa_uid || b.apaar_id || '';
    } else if (sortField === 'grade') {
      aValue = a.enrollments?.[0]?.division?.grade || '';
      bValue = b.enrollments?.[0]?.division?.grade || '';
    } else if (sortField === 'enrollmentDate') {
      aValue = a.enrollments?.[0]?.academic_year?.start_date || a.createdAt || '';
      bValue = b.enrollments?.[0]?.academic_year?.start_date || b.createdAt || '';
    } else if (typeof a[sortField] === 'string') {
      aValue = a[sortField].toLowerCase();
      bValue = b[sortField].toLowerCase();
    } else {
        aValue = a[sortField];
        bValue = b[sortField];
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedStudents(students.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId, checked) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (enrollment_status) => {
    const statusConfig = {
      Enquiry: { bg: 'from-blue-400 to-blue-500', text: 'white', icon: '🔍' },
      Waiting: { bg: 'from-yellow-400 to-orange-500', text: 'white', icon: '⏳' },
      Enrolled: { bg: 'from-green-400 to-emerald-500', text: 'white', icon: '✅' },
      Rejected: { bg: 'from-red-400 to-red-500', text: 'white', icon: '❌' },
      Processing: { bg: 'from-purple-400 to-purple-500', text: 'white', icon: '⚙️' },
      default: { bg: 'from-gray-400 to-gray-500', text: 'white', icon: '📋' },
    };
    const config = statusConfig[enrollment_status] || statusConfig.default;
    return (
      <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-bold rounded-full bg-gradient-to-r ${config.bg} text-${config.text} shadow-sm`}>
        <span>{config.icon}</span>
        {enrollment_status?.charAt(0).toUpperCase() + enrollment_status?.slice(1) || 'N/A'}
      </span>
    );
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return (
        <div className="flex flex-col text-gray-400">
          <ChevronUp className="h-3 w-3 -mb-1" />
          <ChevronDown className="h-3 w-3 -mt-1" />
        </div>
      );
    }

    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-indigo-600 animate-bounce" />
    ) : (
      <ChevronDown className="h-4 w-4 text-indigo-600 animate-bounce" />
    );
  };

  if (loading && students.length === 0) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="p-12 text-center bg-gradient-to-br from-gray-50 to-white rounded-xl">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full mb-6">
          <Users className="w-10 h-10 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Students Found</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Start building your student database by adding your first student.
        </p>
        <Button
          variant="primary"
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          Add Your First Student
        </Button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Table Header Actions */}
      {selectedStudents.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b-2 border-indigo-200 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-100 rounded-full p-2">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="text-sm font-semibold text-indigo-900">
                {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              >
                Export Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              >
                Bulk Actions
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Table */}
      <div className="overflow-x-auto shadow-inner">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === students.length && students.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  <span>Name</span>
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort('studentId')}
              >
                <div className="flex items-center gap-2">
                  <span>Student ID</span>
                  <SortIcon field="studentId" />
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort('grade')}
              >
                <div className="flex items-center gap-2">
                  <span>Grade</span>
                  <SortIcon field="grade" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                Division
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                Guardian
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort('enrollmentDate')}
              >
                <div className="flex items-center gap-2">
                  <span>Enrolled</span>
                  <SortIcon field="enrollmentDate" />
                </div>
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sortedStudents.map((student, index) => (
              <tr
                key={student.id}
                className={`hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-200 ${animateRows ? 'animate-in fade-in slide-in-from-bottom-2' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
                onMouseEnter={() => setHoveredRow(student.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={(e) => handleSelectStudent(student.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center shadow-md transform transition-transform ${hoveredRow === student.id ? 'scale-110' : ''}`}>
                        <span className="text-sm font-bold text-white">
                          {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900">
                        {student.fullName || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.gender ? `${student.gender.charAt(0).toUpperCase() + student.gender.slice(1)}` : ''}
                        {student.dob ? ` • ${formatDate(student.dob)}` : ''}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.ssa_uid || student.apaar_id || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="inline-flex px-3 py-1 text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-800 rounded-full shadow-sm">
                    {student.enrollments?.[0]?.class?.className || student.currentEnrollment?.class?.className || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.enrollments?.[0]?.division?.divisionName || student.currentEnrollment?.division?.divisionName || 'Not Assigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(student.enrollments?.[0]?.enrollmentStatus || student.currentEnrollment?.enrollmentStatus)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {student.guardians?.[0]?.fullName || (student.guardians?.[0]?.firstName && student.guardians?.[0]?.lastName ? `${student.guardians?.[0]?.firstName} ${student.guardians?.[0]?.lastName}` : 'N/A')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {student.guardians?.[0]?.primaryPhone || 'No contact'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(student.enrollments?.[0]?.dateEnrolled || student.currentEnrollment?.dateEnrolled || student.admissionDate || student.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className={`flex justify-center gap-1 transition-all duration-200 ${hoveredRow === student.id ? 'scale-110' : ''}`}>
                    <button
                      onClick={() => onView && onView(student)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all duration-200 hover:scale-110"
                      title="View Student"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/students/${student.id}/finance`)}
                      className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg transition-all duration-200 hover:scale-110"
                      title="View Finance"
                    >
                      <DollarSign className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit && onEdit(student)}
                      className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Edit Student"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(student)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Delete Student"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Loading overlay */}
      {loading && students.length > 0 && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};