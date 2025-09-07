import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEnrollmentStore } from '../../../application/stores/useEnrollmentStore';

export const EnrollmentAdminPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enrollments, fetchEnrollments, loading, error, updateEnrollmentAdministration } = useEnrollmentStore();
  const [enrollment, setEnrollment] = useState(null);
  const [adminData, setAdminData] = useState({
    division: '',
    date_of_admission: '',
    mode: '',
    admission_type: '',
  });

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  useEffect(() => {
    if (enrollments.length > 0) {
      const currentEnrollment = enrollments.find((e) => e.id === parseInt(id));
      setEnrollment(currentEnrollment);
      if (currentEnrollment && currentEnrollment.administration) {
        setAdminData({
          division: currentEnrollment.administration.division?.id || '',
          date_of_admission: currentEnrollment.administration.date_of_admission || '',
          mode: currentEnrollment.administration.mode || '',
          admission_type: currentEnrollment.administration.admission_type || '',
        });
      }
    }
  }, [enrollments, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Assuming enrollment.administration.id holds the ID for the administration entry
      await updateEnrollmentAdministration(enrollment.administration.id, adminData);
      console.log('Administration data saved successfully!');
      navigate(-1); // Go back to the previous page
    } catch (submitError) {
      console.error('Error saving administration data:', submitError);
      // Optionally, set an error state to display to the user
    }
  };

  if (loading) return <div className="text-center py-4">Loading enrollment details...</div>;
  if (error) return <div className="text-center py-4 text-red-600">Error: {error.message}</div>;
  if (!enrollment) return <div className="text-center py-4">Enrollment not found.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Enrollment Administration for {enrollment.student?.first_name} {enrollment.student?.last_name}</h1>
      
      <div className="card p-6 bg-white shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Enrollment Details</h2>
        <p><strong>GR No:</strong> {enrollment.gr_no}</p>
        <p><strong>Class:</strong> {enrollment.class_standard}</p>
        <p><strong>Status:</strong> {enrollment.status}</p>
        <p><strong>Date Enrolled:</strong> {enrollment.date_enrolled}</p>

        <h2 className="text-xl font-semibold mt-6 mb-4">Administration Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="division" className="block text-sm font-medium text-gray-700">Division</label>
            <input
              type="text"
              id="division"
              name="division"
              value={adminData.division}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="date_of_admission" className="block text-sm font-medium text-gray-700">Date of Admission</label>
            <input
              type="date"
              id="date_of_admission"
              name="date_of_admission"
              value={adminData.date_of_admission}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="mode" className="block text-sm font-medium text-gray-700">Mode</label>
            <select
              id="mode"
              name="mode"
              value={adminData.mode}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select Mode</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <div>
            <label htmlFor="admission_type" className="block text-sm font-medium text-gray-700">Admission Type</label>
            <select
              id="admission_type"
              name="admission_type"
              value={adminData.admission_type}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select Admission Type</option>
              <option value="new">New</option>
              <option value="transfer">Transfer</option>
              <option value="readmission">Readmission</option>
            </select>
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Save Administration Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
