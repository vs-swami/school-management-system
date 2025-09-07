import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useStudentStore } from '../../../application/stores/useStudentStore';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { AcademicYearRepository } from '../../../data/repositories/AcademicYearRepository';
import { DivisionRepository } from '../../../data/repositories/DivisionRepository';

// Helper function to format initial data for the form
const formatInitialData = (initialData, mode) => {
  if (mode === 'create' || !initialData) {
    return {
      gr_full_name: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      gender: '',
      dob: '',
      guardians: [{
        full_name: '',
        relation: '',
        mobile: '',
        occupation: '',
        primary_contact: false,
      }],
      enrollments: [{
        academic_year: '',
        class_standard: '',
        gr_no: '',
        date_enrolled: '',
      }],
      student_photo: null,
      guardian_photo: null,
    };
  }

  // Format the data for editing
  const formattedData = {
    ...initialData,
    dob: initialData.dob ? new Date(initialData.dob).toISOString().split('T')[0] : '',
  };

  // Handle guardian data - check for both transformed and untransformed formats
  let guardianData = null;
  
  if (initialData.guardians) {
    // Check if data is already transformed (flat array)
    if (Array.isArray(initialData.guardians) && initialData.guardians.length > 0) {
      guardianData = initialData.guardians[0];
    }
    // Check if data is in Strapi format (nested with data.attributes)
    else if (initialData.guardians.data && Array.isArray(initialData.guardians.data) && initialData.guardians.data.length > 0) {
      const rawGuardian = initialData.guardians.data[0];
      if (rawGuardian.attributes) {
        guardianData = {
          id: rawGuardian.id,
          ...rawGuardian.attributes
        };
      } else {
        guardianData = rawGuardian;
      }
    }
  }

  if (guardianData) {
    formattedData.guardians = [{
      id: guardianData.id, // Keep the guardian ID for updates
      full_name: guardianData.full_name || '',
      relation: guardianData.relation || '',
      mobile: guardianData.mobile || '',
      occupation: guardianData.occupation || '',
      primary_contact: guardianData.primary_contact || false,
    }];
  } else {
    // No guardian data, use empty guardian
    formattedData.guardians = [{
      full_name: '',
      relation: '',
      mobile: '',
      occupation: '',
      primary_contact: false,
    }];
  }

  // Handle enrollment data
  let enrollmentData = null;
  if (initialData.enrollments) {
    if (Array.isArray(initialData.enrollments) && initialData.enrollments.length > 0) {
      enrollmentData = initialData.enrollments[0];
    } else if (initialData.enrollments.data && Array.isArray(initialData.enrollments.data) && initialData.enrollments.data.length > 0) {
      const rawEnrollment = initialData.enrollments.data[0];
      if (rawEnrollment.attributes) {
        enrollmentData = {
          id: rawEnrollment.id,
          ...rawEnrollment.attributes,
          academic_year: rawEnrollment.attributes.academic_year?.data?.id || rawEnrollment.attributes.academic_year?.id,
          division: rawEnrollment.attributes.division?.data?.id || rawEnrollment.attributes.division?.id,
        };
      } else {
        enrollmentData = rawEnrollment;
      }
    }
  }

  if (enrollmentData) {
    formattedData.enrollments = [{
      ...enrollmentData,
      class_standard: parseInt(enrollmentData.class_standard, 10) || '',
      date_enrolled: enrollmentData.date_enrolled ? new Date(enrollmentData.date_enrolled).toISOString().split('T')[0] : '',
    }];
  } else {
    // No enrollment data, use empty enrollment
    formattedData.enrollments = [{
      academic_year: '',
      class_standard: '',
      gr_no: '',
      date_enrolled: '',
    }];
  }

  return formattedData;
};

// Helper function to format data for API submission
const formatSubmissionData = (formData, mode, initialData) => {
  console.log('formatSubmissionData - Raw formData from useForm:', JSON.stringify(formData, null, 2));

  const submissionData = {
    gr_full_name: formData.gr_full_name,
    first_name: formData.first_name,
    middle_name: formData.middle_name,
    last_name: formData.last_name,
    gender: formData.gender,
    dob: formData.dob,
  };

  // Consistently send guardians and enrollments arrays as received from formData.
  // The backend's service functions (createStudentWithRelations, updateWithGuardians)
  // are responsible for handling creation vs. update based on the presence of an 'id' within each item.
  submissionData.guardians = formData.guardians;
  submissionData.enrollments = formData.enrollments.map(enrollment => ({
    academic_year: enrollment.academic_year,
    class_standard: enrollment.class_standard,
    gr_no: enrollment.gr_no,
    date_enrolled: enrollment.date_enrolled,
  }));

  return submissionData;
};

export const StudentModal = ({ isOpen, onClose, mode = 'create', initialData = null }) => {
  const { createStudent, updateStudent, loading } = useStudentStore();
  const [apiError, setApiError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: Student, 1: Enrollment, 2: Guardian
  const [academicYears, setAcademicYears] = useState([]);
  const [divisions, setDivisions] = useState([]);

  const formData = formatInitialData(initialData, mode);
  const { register, handleSubmit, formState: { errors }, reset, setError, trigger, setValue } = useForm({
    defaultValues: formData,
  });

  // Reset form when modal opens/closes or data changes
  useEffect(() => {
    if (isOpen) {
      const newFormData = formatInitialData(initialData, mode);
      console.log('Setting form data:', newFormData); // Debug log
      reset(newFormData);
      setApiError('');
      setIsSuccess(false);
      setCurrentStep(0); // Reset to first step on open
    }
  }, [isOpen, initialData, mode, reset]);

  // Fetch academic years and divisions when the modal opens
  useEffect(() => {
    const fetchDropdownData = async () => {
      if (isOpen) {
        try {
          const years = await AcademicYearRepository.findAll();
          setAcademicYears(years);
          const divs = await DivisionRepository.findAll();
          setDivisions(divs);
          console.log('Fetched Academic Years:', years);
          console.log('Fetched Divisions:', divs);
        } catch (err) {
          console.error("Error fetching dropdown data:", err);
          setApiError("Failed to load academic years or divisions.");
        }
      }
    };
    fetchDropdownData();
  }, [isOpen]);

  const onSubmit = async (data) => {
    setApiError(''); // Clear previous errors
    setIsSuccess(false); // Clear previous success
    
    console.log('onSubmit - Data before step check:', JSON.stringify(data, null, 2));

    if (currentStep < 3) { // Updated from < 2 to < 3 for 4 steps
      // Move to the next step if validation passes for the current step
      const isValid = await trigger(); // Trigger validation for all fields in the form
      if (isValid) {
        setCurrentStep(prev => prev + 1);
      }
      return; // Stop here, don't submit yet
    }

    // Only on the last step (currentStep === 3), proceed with submission
    const submissionData = formatSubmissionData(data, mode, initialData);
    console.log('Final Submission Data:', submissionData);
    console.log('Enrollments in Submission Data:', submissionData.enrollments);

    // Separate file data from regular form data
    console.log('Raw data.student_photo from react-hook-form:', data.student_photo);
    console.log('Extracted data.student_photo[0]:', data.student_photo?.[0]);
    console.log('Raw data.guardian_photo from react-hook-form:', data.guardian_photo);
    console.log('Extracted data.guardian_photo[0]:', data.guardian_photo?.[0]);
    const files = {
      student_photo: data.student_photo?.[0],
      guardian_photo: data.guardian_photo?.[0],
    };

    try {
      let result;
      if (mode === 'edit' && initialData) {
        result = await updateStudent(initialData.id, submissionData, files);
      } else {
        result = await createStudent(submissionData, files);
      }

      if (result.success) {
        setIsSuccess(true);
        if (mode === 'create') {
          reset(formatInitialData(null, 'create'));
        }
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2000);
      } else {
        console.error(`Error ${mode}ing student:`, result);
        if (result.details && typeof result.details === 'object') {
          for (const field in result.details) {
            setError(field, { type: 'server', message: result.details[field][0] });
          }
          setApiError('Please correct the highlighted errors.');
        } else {
          setApiError(result.error || `An error occurred while ${mode}ing the student`);
        }
      }
    } catch (error) {
      console.error(`Unexpected error during ${mode}ing student:`, error);
      setApiError('An unexpected error occurred.');
    }
  };

  const handleClose = () => {
    setApiError(''); // Clear errors when closing
    setIsSuccess(false); // Clear success when closing
    reset(formatInitialData(null, 'create')); // Reset form
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-90vh overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'edit' ? 'Edit Student' : `Add New Student (Step ${currentStep + 1} of 3)`}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Display Success Message */}
          {isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    Student {mode === 'edit' ? 'Updated' : 'Created'} Successfully!
                  </h3>
                  <p className="mt-1 text-sm text-green-700">
                    The student has been {mode === 'edit' ? 'updated' : 'added to the system'}. This window will close automatically.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Display API Error */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Error {mode === 'edit' ? 'Updating' : 'Creating'} Student
                  </h3>
                  <p className="mt-1 text-sm text-red-700">{apiError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Debug info - remove this in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <details>
                <summary className="text-sm font-medium text-blue-800 cursor-pointer">
                  Debug: Data Structure
                </summary>
                <div className="mt-2 text-xs text-blue-700 space-y-2">
                  <div>
                    <strong>Mode:</strong> {mode}
                  </div>
                  <div>
                    <strong>Initial Data:</strong>
                    <pre className="overflow-auto">{JSON.stringify(initialData, null, 2)}</pre>
                  </div>
                  <div>
                    <strong>Form Default Values:</strong>
                    <pre className="overflow-auto">{JSON.stringify(formData, null, 2)}</pre>
                  </div>
                </div>
              </details>
            </div>
          )}

          {/* Step 1: Student Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4">Student Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (as per GR) *</label>
                  <input {...register('gr_full_name', { required: 'Full name is required' })} className="input" />
                  {errors.gr_full_name && (<p className="mt-1 text-sm text-red-600">{errors.gr_full_name.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input {...register('first_name', { required: 'First name is required' })} className="input" />
                  {errors.first_name && (<p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input {...register('middle_name')} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input {...register('last_name', { required: 'Last name is required' })} className="input" />
                  {errors.last_name && (<p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select {...register('gender', { required: 'Gender is required' })} className="input">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (<p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input type="date" {...register('dob', { required: 'Date of birth is required' })} className="input" />
                  {errors.dob && (<p className="mt-1 text-sm text-red-600">{errors.dob.message}</p>)}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Enrollment Information (Required Fields Only) */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4">Enrollment Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                  <select {...register('enrollments.0.academic_year', { required: 'Academic year is required' })} className="input">
                    <option value="">Select Academic Year</option>
                    {academicYears.map(year => (
                      <option key={year.id} value={year.id}>{year.code}</option>
                    ))}
                  </select>
                  {errors.enrollments?.[0]?.academic_year && (<p className="mt-1 text-sm text-red-600">{errors.enrollments[0].academic_year.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class Standard *</label>
                  <input type="number" {...register('enrollments.0.class_standard', { required: 'Class standard is required', min: { value: 1, message: 'Min class is 1' }, max: { value: 12, message: 'Max class is 12' }, valueAsNumber: true })} className="input" placeholder="e.g., 5" />
                  {errors.enrollments?.[0]?.class_standard && (<p className="mt-1 text-sm text-red-600">{errors.enrollments[0].class_standard.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GR No. *</label>
                  <input {...register('enrollments.0.gr_no', { required: 'GR No. is required' })} className="input" placeholder="e.g., GR12345" />
                  {errors.enrollments?.[0]?.gr_no && (<p className="mt-1 text-sm text-red-600">{errors.enrollments[0].gr_no.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Enrolled *</label>
                  <input type="date" {...register('enrollments.0.date_enrolled', { required: 'Date enrolled is required' })} className="input" />
                  {errors.enrollments?.[0]?.date_enrolled && (<p className="mt-1 text-sm text-red-600">{errors.enrollments[0].date_enrolled.message}</p>)}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Guardian Details Section */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4">Guardian Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Full Name *</label>
                  <input {...register('guardians.0.full_name', { required: 'Guardian full name is required' })} className="input" />
                  {errors.guardians?.[0]?.full_name && (<p className="mt-1 text-sm text-red-600">{errors.guardians[0].full_name.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relation *</label>
                  <select {...register('guardians.0.relation', { required: 'Relation is required' })} className="input">
                    <option value="">Select Relation</option>
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="guardian">Guardian</option>
                  </select>
                  {errors.guardians?.[0]?.relation && (<p className="mt-1 text-sm text-red-600">{errors.guardians[0].relation.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <input type="tel" {...register('guardians.0.mobile', { required: 'Mobile number is required' })} className="input" />
                  {errors.guardians?.[0]?.mobile && (<p className="mt-1 text-sm text-red-600">{errors.guardians[0].mobile.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                  <input {...register('guardians.0.occupation')} className="input" />
                </div>
                <div className="md:col-span-2 flex items-center">
                  <input type="checkbox" {...register('guardians.0.primary_contact')} id="primary_contact" className="mr-2" />
                  <label htmlFor="primary_contact" className="text-sm font-medium text-gray-700">Primary Contact</label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Documents Upload */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4">Document Uploads</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="student_photo" className="block text-sm font-medium text-gray-700 mb-1">Student Photo *</label>
                  <input 
                    type="file" 
                    id="student_photo" 
                    {...register('student_photo', { required: 'Student photo is required' })} 
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {errors.student_photo && (<p className="mt-1 text-sm text-red-600">{errors.student_photo.message}</p>)}
                </div>
                <div>
                  <label htmlFor="guardian_photo" className="block text-sm font-medium text-gray-700 mb-1">Primary Guardian Photo *</label>
                  <input 
                    type="file" 
                    id="guardian_photo" 
                    {...register('guardian_photo', { required: 'Primary guardian photo is required' })} 
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {errors.guardian_photo && (<p className="mt-1 text-sm text-red-600">{errors.guardian_photo.message}</p>)}
                </div>
                {/* Add more document fields as needed */}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="btn btn-secondary"
                disabled={loading || isSuccess}
              >
                Previous
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={loading || isSuccess}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || isSuccess}
            >
              {currentStep < 3 ? 'Next' : (
                loading ? 
                  (mode === 'edit' ? 'Updating...' : 'Creating...') : 
                  (isSuccess ? (mode === 'edit' ? 'Updated!' : 'Created!') : (mode === 'edit' ? 'Update Student' : 'Create Student'))
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};