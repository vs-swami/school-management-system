import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnrollmentStore } from '../../../application/stores/useEnrollmentStore';

export const EnrollmentList = () => {
  const { enrollments, loading, error, fetchEnrollments, updateEnrollmentStatus } = useEnrollmentStore();
  const navigate = useNavigate();

  console.log('EnrollmentList: enrollments state', enrollments);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleStatusChange = async (id, newStatus) => {
    await updateEnrollmentStatus(id, newStatus);
  };

  const handleStartAdministration = (enrollmentId) => {
    navigate(`/enrollments/${enrollmentId}/admin`);
  };

  if (loading) return <div className="text-center py-4">Loading enrollments...</div>;
  if (error) return <div className="text-center py-4 text-red-600">Error: {error.message}</div>;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Enrollment Management</h1>
      
      <div className="card p-4 sm:p-6 bg-white shadow rounded-lg">
        {enrollments.length === 0 ? (
          <p className="text-gray-600">No enrollments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xxs sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th scope="col" className="px-3 py-2 text-left text-xxs sm:text-xs font-medium text-gray-500 uppercase tracking-wider">GR No.</th>
                  <th scope="col" className="px-3 py-2 text-left text-xxs sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th scope="col" className="px-3 py-2 text-left text-xxs sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
                  <th scope="col" className="px-3 py-2 text-left text-xxs sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-3 py-2 text-left text-xxs sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-xxs sm:text-sm font-medium text-gray-900">{enrollment.student?.first_name} {enrollment.student?.last_name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xxs sm:text-sm text-gray-500">{enrollment.gr_no}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xxs sm:text-sm text-gray-500">{enrollment.class_standard}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xxs sm:text-sm text-gray-500">{enrollment.enrollment_status}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {enrollment.enrollment_status === 'Enquiry' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Enquiry
                        </span>
                      )}
                      {enrollment.enrollment_status === 'Waiting' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Waiting
                        </span>
                      )}
                      {enrollment.enrollment_status === 'Enrolled' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Enrolled
                        </span>
                      )}
                      {enrollment.enrollment_status === 'Rejected' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Rejected
                        </span>
                      )}
                      {enrollment.enrollment_status === 'Processing' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          Processing
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xxs sm:text-sm text-gray-500">{enrollment.administration?.division?.name || 'N/A'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xxs sm:text-sm text-gray-500">{enrollment.administration?.date_of_admission || 'N/A'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-xxs sm:text-sm font-medium">
                      {enrollment.enrollment_status === 'Enquiry' && (
                        <div className="flex flex-wrap gap-1">
                          <button
                            onClick={() => handleStartAdministration(enrollment.id)}
                            className="bg-indigo-500 hover:bg-indigo-700 text-white font-medium py-1 px-2 rounded text-xs"
                          >
                            Admin
                          </button>
                          <button
                            onClick={() => handleStatusChange(enrollment.id, 'Waiting')}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded text-xs"
                          >
                            Waiting
                          </button>
                          <button
                            onClick={() => handleStatusChange(enrollment.id, 'Dropped')}
                            className="bg-red-500 hover:bg-red-700 text-white font-medium py-1 px-2 rounded text-xs"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      {enrollment.enrollment_status === 'Waiting' && (
                        <div className="flex flex-wrap gap-1">
                          <button
                            onClick={() => handleStartAdministration(enrollment.id)}
                            className="bg-indigo-500 hover:bg-indigo-700 text-white font-medium py-1 px-2 rounded text-xs"
                          >
                            Admin
                          </button>
                          <button
                            onClick={() => handleStatusChange(enrollment.id, 'Enrolled')}
                            className="bg-green-500 hover:bg-green-700 text-white font-medium py-1 px-2 rounded text-xs"
                          >
                            Enrolled
                          </button>
                          <button
                            onClick={() => handleStatusChange(enrollment.id, 'Dropped')}
                            className="bg-red-500 hover:bg-red-700 text-white font-medium py-1 px-2 rounded text-xs"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      {enrollment.enrollment_status === 'Enrolled' && (
                        <div className="flex flex-wrap gap-1">
                          <button
                            onClick={() => handleStatusChange(enrollment.id, 'Dropped')}
                            className="bg-red-500 hover:bg-red-700 text-white font-medium py-1 px-2 rounded text-xs"
                          >
                            Mark Dropped
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};