import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEnrollmentStore } from '../../../application/stores/useEnrollmentStore';
import { DivisionRepository } from '../../../data/repositories/DivisionRepository';
import { Calendar, Truck, Home, DollarSign, ArrowLeft, ArrowRight } from 'lucide-react';

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
    transport_details: '',
    hostel_details: '',
    fees_details: '',
  });
  const [currentAdminStep, setCurrentAdminStep] = useState(0);
  const [divisions, setDivisions] = useState([]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const fetchedDivisions = await DivisionRepository.findAll();
        setDivisions(fetchedDivisions);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        // Optionally, set an error state
      }
    };
    fetchDropdownData();
  }, []);

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
          transport_details: currentEnrollment.administration.transport_details || '',
          hostel_details: currentEnrollment.administration.hostel_details || '',
          fees_details: currentEnrollment.administration.fees_details || '',
        });
      }
    }
  }, [enrollments, id, divisions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentAdminStep < 3) { // 4 steps (0-3)
      setCurrentAdminStep(prev => prev + 1);
      return;
    }
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

  if (loading) return <div className="text-center py-4 text-blue-600">Loading enrollment details...</div>;
  if (error) return <div className="text-center py-4 text-red-600">Error: {error.message}</div>;
  if (!enrollment) return <div className="text-center py-4">Enrollment not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-4 sm:p-6 md:p-8 lg:p-10 font-sans antialiased text-gray-800 animate-fade-in">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-200">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-blue-800 mb-2 text-center leading-tight">Enrollment Administration</h1>
          <p className="text-center text-gray-600 text-base md:text-lg">Manage administrative details for {enrollment.student?.first_name} {enrollment.student?.last_name}</p>
        </div>

        <div className="p-8 sm:p-10">
          {/* Enrollment Details Section */}
          <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-200 shadow-sm">
            <h2 className="text-2xl font-bold text-blue-700 mb-5 flex items-center">
              Enrollment Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-8 text-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-500">GR No:</p>
                <p className="text-lg font-semibold">{enrollment.gr_no}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Class:</p>
                <p className="text-lg font-semibold">{enrollment.class_standard}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status:</p>
                <p className="text-lg font-semibold capitalize">{enrollment.enrollment_status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date Enrolled:</p>
                <p className="text-lg font-semibold">{enrollment.date_enrolled}</p>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="mb-10 flex justify-center space-x-3">
            {[0, 1, 2, 3].map((stepIdx) => (
              <span
                key={stepIdx}
                className={`h-2 w-12 rounded-full transition-all duration-300 ease-in-out ${currentAdminStep === stepIdx ? 'bg-blue-600 shadow-md' : 'bg-gray-200'}`}
              ></span>
            ))}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center">Step {currentAdminStep + 1} of 4</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {currentAdminStep === 0 && (
              <div className="card p-6 sm:p-8 bg-white rounded-2xl shadow-lg border border-gray-200 animate-fade-in">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 flex items-center"><Calendar className="w-6 h-6 mr-3 text-blue-500" /> Admission Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="division" className="block text-sm font-medium text-gray-700 mb-2">Division</label>
                    <select
                      id="division"
                      name="division"
                      value={adminData.division}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 sm:p-3 bg-gray-50 text-gray-700 text-sm sm:text-base focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                    >
                      <option value="">Select Division</option>
                      {divisions.map((div) => (
                        <option key={div.id} value={div.id}>
                          {div.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="date_of_admission" className="block text-sm font-medium text-gray-700 mb-2">Date of Admission</label>
                    <input
                      type="date"
                      id="date_of_admission"
                      name="date_of_admission"
                      value={adminData.date_of_admission}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 sm:p-3 bg-gray-50 text-gray-700 text-sm sm:text-base focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                    />
                  </div>
                  <div>
                    <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                    <select
                      id="mode"
                      name="mode"
                      value={adminData.mode}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 sm:p-3 bg-gray-50 text-gray-700 text-sm sm:text-base focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                    >
                      <option value="">Select Mode</option>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="admission_type" className="block text-sm font-medium text-gray-700 mb-2">Admission Type</label>
                    <select
                      id="admission_type"
                      name="admission_type"
                      value={adminData.admission_type}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 sm:p-3 bg-gray-50 text-gray-700 text-sm sm:text-base focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                    >
                      <option value="">Select Admission Type</option>
                      <option value="new">New</option>
                      <option value="transfer">Transfer</option>
                      <option value="readmission">Readmission</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentAdminStep === 1 && (
              <div className="card p-6 sm:p-8 bg-white rounded-2xl shadow-lg border border-gray-200 animate-fade-in">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 flex items-center"><Truck className="w-6 h-6 mr-3 text-green-600" /> Transport Details</h3>
                <div>
                  <label htmlFor="transport_details" className="block text-sm font-medium text-gray-700 mb-2">Transport Details</label>
                  <textarea
                    id="transport_details"
                    name="transport_details"
                    value={adminData.transport_details}
                    onChange={handleChange}
                    rows="6"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 sm:p-3 bg-gray-50 text-gray-700 text-sm sm:text-base focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                  ></textarea>
                </div>
              </div>
            )}

            {currentAdminStep === 2 && (
              <div className="card p-6 sm:p-8 bg-white rounded-2xl shadow-lg border border-gray-200 animate-fade-in">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 flex items-center"><Home className="w-6 h-6 mr-3 text-purple-600" /> Hostel Details</h3>
                <div>
                  <label htmlFor="hostel_details" className="block text-sm font-medium text-gray-700 mb-2">Hostel Details</label>
                  <textarea
                    id="hostel_details"
                    name="hostel_details"
                    value={adminData.hostel_details}
                    onChange={handleChange}
                    rows="6"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 sm:p-3 bg-gray-50 text-gray-700 text-sm sm:text-base focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                  ></textarea>
                </div>
              </div>
            )}

            {currentAdminStep === 3 && (
              <div className="card p-6 sm:p-8 bg-white rounded-2xl shadow-lg border border-gray-200 animate-fade-in">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 flex items-center"><DollarSign className="w-6 h-6 mr-3 text-yellow-600" /> Fees Details</h3>
                <div>
                  <label htmlFor="fees_details" className="block text-sm font-medium text-gray-700 mb-2">Fees Details</label>
                  <textarea
                    id="fees_details"
                    name="fees_details"
                    value={adminData.fees_details}
                    onChange={handleChange}
                    rows="6"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 sm:p-3 bg-gray-50 text-gray-700 text-sm sm:text-base focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
                  ></textarea>
                </div>
              </div>
            )}

            <div className="flex justify-center space-x-4 mt-10">
              {currentAdminStep > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentAdminStep(prev => prev - 1)}
                  className="flex items-center px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition duration-300 ease-in-out shadow-sm text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Previous
                </button>
              )}
              <button
                type="submit"
                className="flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out shadow-md text-sm sm:text-base"
              >
                {currentAdminStep < 3 ? (<>Next <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" /></>) : 'Save Administration Details'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
