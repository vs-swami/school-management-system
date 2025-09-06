import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {useStudentStore} from '../../../application/stores/useStudentStore';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

export const StudentModal = ({ isOpen, onClose }) => {
  const { createStudent, loading } = useStudentStore();
  const { register, handleSubmit, formState: { errors }, reset, setError } = useForm();
  const [apiError, setApiError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = async (data) => {
    setApiError(''); // Clear previous errors
    setIsSuccess(false); // Clear previous success
    console.log('Submitting student data:', data);
    const result = await createStudent(data);
    
    if (result.success) {
      setIsSuccess(true); // Show success message
      reset();
      // Close modal after showing success message for 2 seconds
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } else {
      // Display the API error or detailed validation errors
      console.error('Error creating student:', result.error);
      if (result.details && typeof result.details === 'object') {
        // Set specific field errors using react-hook-form's setError
        for (const field in result.details) {
          setError(field, { type: 'server', message: result.details[field][0] });
        }
        setApiError('Please correct the highlighted errors.');
      } else {
        setApiError(result.error || 'An error occurred while creating the student');
      }
    }
  };

  const handleClose = () => {
    setApiError(''); // Clear errors when closing
    setIsSuccess(false); // Clear success when closing
    reset(); // Reset form
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-90vh overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add New Student</h3>
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
                    Student Created Successfully!
                  </h3>
                  <p className="mt-1 text-sm text-green-700">
                    The student has been added to the system. This window will close automatically.
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
                    Error Creating Student
                  </h3>
                  <p className="mt-1 text-sm text-red-700">{apiError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name (as per GR) *
              </label>
              <input
                {...register('gr_full_name', { required: 'Full name is required' })}
                className="input"
              />
              {errors.gr_full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.gr_full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                {...register('first_name', { required: 'First name is required' })}
                className="input"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Middle Name
              </label>
              <input
                {...register('middle_name')}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                {...register('last_name', { required: 'Last name is required' })}
                className="input"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                {...register('gender', { required: 'Gender is required' })}
                className="input"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                {...register('dob', { required: 'Date of birth is required' })}
                className="input"
              />
              {errors.dob && (
                <p className="mt-1 text-sm text-red-600">{errors.dob.message}</p>
              )}
            </div>
          </div>

          {/* Guardian Details Section */}
          <h4 className="text-md font-semibold text-gray-800 mt-6 mb-4">Guardian Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guardian Full Name *
              </label>
              <input
                {...register('guardians.0.full_name', { required: 'Guardian full name is required' })}
                className="input"
              />
              {errors['guardians.0.full_name'] && (
                <p className="mt-1 text-sm text-red-600">{errors['guardians.0.full_name'].message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relation *
              </label>
              <select
                {...register('guardians.0.relation', { required: 'Relation is required' })}
                className="input"
              >
                <option value="">Select Relation</option>
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Guardian</option>
              </select>
              {errors['guardians.0.relation'] && (
                <p className="mt-1 text-sm text-red-600">{errors['guardians.0.relation'].message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                {...register('guardians.0.mobile', { required: 'Mobile number is required' })}
                className="input"
              />
              {errors['guardians.0.mobile'] && (
                <p className="mt-1 text-sm text-red-600">{errors['guardians.0.mobile'].message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occupation
              </label>
              <input
                {...register('guardians.0.occupation')}
                className="input"
              />
            </div>

            <div className="md:col-span-2 flex items-center">
              <input
                type="checkbox"
                {...register('guardians.0.primary_contact')}
                id="primary_contact"
                className="mr-2"
              />
              <label htmlFor="primary_contact" className="text-sm font-medium text-gray-700">
                Primary Contact
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
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
              {loading ? 'Creating...' : isSuccess ? 'Created!' : 'Create Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};