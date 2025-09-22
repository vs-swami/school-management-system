import React, { useState } from 'react';
import { Eye, Edit, Trash2, Phone, Mail, Calendar, MapPin, GraduationCap, User } from 'lucide-react';
import { Button } from '../common/Button';

export const StudentGrid = ({ students = [], loading = false, onEdit, onDelete, onView }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

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

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 rounded-full bg-gray-200"></div>
          <div>
            <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-gray-200 rounded"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  if (loading && students.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
        {[...Array(8)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="p-12 text-center bg-gradient-to-br from-gray-50 to-white rounded-xl">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full mb-6">
          <User className="w-10 h-10 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Students Found</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Start building your student database by adding your first student.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
      {students.map((student, index) => (
        <div
          key={student.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
          onMouseEnter={() => setHoveredCard(student.id)}
          onMouseLeave={() => setHoveredCard(null)}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-14 w-14 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center shadow-md transform transition-transform ${hoveredCard === student.id ? 'scale-110' : ''}`}>
                  <span className="text-lg font-bold text-white">
                    {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {student.fullName || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A'}
                  </h3>
                  <p className="text-xs text-gray-600">
                    ID: {student.ssa_uid || student.apaar_id || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-3">
            {/* Status Badge */}
            <div className="flex justify-center">
              {getStatusBadge(student.enrollments?.[0]?.enrollmentStatus || student.currentEnrollment?.enrollmentStatus)}
            </div>

            {/* Student Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <GraduationCap className="h-4 w-4 text-indigo-500" />
                <span className="font-medium">
                  {student.enrollments?.[0]?.class?.className || student.currentEnrollment?.class?.className || 'N/A'}
                  {student.enrollments?.[0]?.division?.divisionName &&
                    ` - ${student.enrollments?.[0]?.division?.divisionName}`}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 text-indigo-500" />
                <span>{formatDate(student.dob)}</span>
              </div>

              {student.guardians?.[0] && (
                <>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="h-4 w-4 text-indigo-500" />
                    <span className="truncate">
                      {student.guardians[0].fullName ||
                       (student.guardians[0].firstName && student.guardians[0].lastName
                        ? `${student.guardians[0].firstName} ${student.guardians[0].lastName}`
                        : 'N/A')}
                    </span>
                  </div>
                  {student.guardians[0].primaryPhone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 text-indigo-500" />
                      <span>{student.guardians[0].primaryPhone}</span>
                    </div>
                  )}
                </>
              )}

              {student.address && (
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs truncate">
                    {typeof student.address === 'string'
                      ? student.address
                      : `${student.address.street || ''} ${student.address.city || ''} ${student.address.state || ''}`.trim() || 'N/A'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card Footer - Actions */}
          <div className="border-t border-gray-100 p-3 bg-gray-50">
            <div className="flex justify-center gap-2">
              <button
                onClick={() => onView && onView(student)}
                className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all duration-200 hover:scale-110"
                title="View Student"
              >
                <Eye className="h-4 w-4" />
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
          </div>
        </div>
      ))}
    </div>
  );
};