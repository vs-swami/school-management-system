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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Enrollment Management</h1>
      
      <div className="card p-6 bg-white shadow rounded-lg">
        {enrollments.length === 0 ? (
          <p className="text-gray-600">No enrollments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GR No.</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{enrollment.student?.first_name} {enrollment.student?.last_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enrollment.gr_no}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enrollment.class_standard}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enrollment.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {enrollment.status === 'Enquiry' && (
                        <>
                          <button
                            onClick={() => handleStartAdministration(enrollment.id)}
                            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mr-2"
                          >
                            Start Administration
                          </button>
                          <button
                            onClick={() => handleStatusChange(enrollment.id, 'Waiting')}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                          >
                            Move to Waiting
                          </button>
                          <button
                            onClick={() => handleStatusChange(enrollment.id, 'Dropped')}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {enrollment.status === 'Waiting' && (
                        <>
                          <button
                            onClick={() => handleStartAdministration(enrollment.id)}
                            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mr-2"
                          >
                            Start Administration
                          </button>
                          <button
                            onClick={() => handleStatusChange(enrollment.id, 'Enrolled')}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                          >
                            Mark Enrolled
                          </button>
                          <button
                            onClick={() => handleStatusChange(enrollment.id, 'Dropped')}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {enrollment.status === 'Enrolled' && (
                        <button
                          onClick={() => handleStatusChange(enrollment.id, 'Dropped')}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
                        >
                          Mark Dropped
                        </button>
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