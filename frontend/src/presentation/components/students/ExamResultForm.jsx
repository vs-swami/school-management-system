import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { PlusCircle, MinusCircle, BookOpen, Tag } from 'lucide-react';
import useStudentStore from '../../../application/stores/useStudentStore'; // NEW: Import useStudentStore

const ExamResultForm = ({ studentId, academicYears, classes, initialExamResult, onSaveSuccess, onCancel }) => {
  const { saveExamResults, loading, setLoading, error, setError } = useStudentStore(); // Access store actions and state

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: initialExamResult || {
      academic_year: '',
      class: '',
      exam_type: '',
      subject: '',
      marks_obtained: '',
      total_marks: '',
      grade: '',
      pass_fail: false,
    },
  });

  // Effect to reset the form when initialExamResult changes (e.g., when editing a different result)
  React.useEffect(() => {
    if (initialExamResult) {
      reset({
        ...initialExamResult,
        academic_year: String(initialExamResult.academic_year?.id || initialExamResult.academic_year || ''),
        class: String(initialExamResult.class?.id || initialExamResult.class || ''),
      });
    } else {
      reset({
        academic_year: '',
        class: '',
        exam_type: '',
        subject: '',
        marks_obtained: '',
        total_marks: '',
        grade: '',
        pass_fail: false,
      });
    }
  }, [initialExamResult, reset]);

  const onSubmit = async (data) => {
    console.log('ExamResultForm.onSubmit triggered!', data); // NEW: Debug log
    if (!studentId) {
      setError('Student ID is missing. Cannot save exam results.');
      return;
    }

    setLoading(true);
    setError(null);

    // Ensure academic_year and class are numbers for backend
    const submissionData = {
      ...data,
      ...(initialExamResult && { id: initialExamResult.id }), // Include ID if editing existing result
      academic_year: data.academic_year ? parseInt(data.academic_year) : undefined,
      class: data.class ? parseInt(data.class) : undefined,
      student: studentId, // Link exam result to the student
    };

    try {
      // saveExamResults expects an array, so wrap the single result
      const result = await saveExamResults(studentId, [submissionData]);
      if (result.success) {
        console.log('ExamResultForm: Save successful, calling onSaveSuccess.'); // NEW: Debug log
        onSaveSuccess(); // Close modal and refresh list in parent
      } else {
        setError(result.error || 'Failed to save exam result.');
      }
    } catch (err) {
      console.error('Error saving exam result:', err);
      setError('An unexpected error occurred while saving the exam result.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>}
      <h5 className="text-lg font-semibold text-gray-800 mb-4">Exam Result Details</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Academic Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
          <select
            {...register('academic_year', { required: 'Academic Year is required' })}
            className="input"
          >
            <option value="">Select Academic Year</option>
            {academicYears.map(year => (
              <option key={year.id} value={year.id}>{year.code}</option>
            ))}
          </select>
          {errors.academic_year && (
            <p className="mt-1 text-sm text-red-600">{errors.academic_year.message}</p>
          )}
        </div>

        {/* Class */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select
            {...register('class', { required: 'Class is required' })}
            className="input"
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.classname}</option>
            ))}
          </select>
          {errors.class && (
            <p className="mt-1 text-sm text-red-600">{errors.class.message}</p>
          )}
        </div>

        {/* Exam Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
          <input
            type="text"
            {...register('exam_type', { required: 'Exam Type is required' })}
            className="input"
            placeholder="e.g., Term 1, Annual"
          />
          {errors.exam_type && (
            <p className="mt-1 text-sm text-red-600">{errors.exam_type.message}</p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            {...register('subject', { required: 'Subject is required' })}
            className="input"
            placeholder="e.g., Mathematics"
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
          )}
        </div>

        {/* Marks Obtained */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marks Obtained</label>
          <input
            type="number"
            {...register('marks_obtained', { required: 'Marks Obtained are required', valueAsNumber: true })}
            className="input"
            placeholder="e.g., 85"
          />
          {errors.marks_obtained && (
            <p className="mt-1 text-sm text-red-600">{errors.marks_obtained.message}</p>
          )}
        </div>

        {/* Total Marks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
          <input
            type="number"
            {...register('total_marks', { required: 'Total Marks are required', valueAsNumber: true })}
            className="input"
            placeholder="e.g., 100"
          />
          {errors.total_marks && (
            <p className="mt-1 text-sm text-red-600">{errors.total_marks.message}</p>
          )}
        </div>

        {/* Grade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
          <input
            type="text"
            {...register('grade')}
            className="input"
            placeholder="e.g., A+"
          />
          {errors.grade && (
            <p className="mt-1 text-sm text-red-600">{errors.grade.message}</p>
          )}
        </div>

        {/* Pass/Fail */}
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            {...register('pass_fail')}
            id="pass_fail_single"
            className="mr-2"
          />
          <label htmlFor="pass_fail_single" className="text-sm font-medium text-gray-700">
            Pass / Fail
          </label>
          {errors.pass_fail && (
            <p className="mt-1 text-sm text-red-600">{errors.pass_fail.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="button" // Changed to type="button"
          onClick={handleSubmit(onSubmit)} // Manually trigger handleSubmit
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Exam Result'}
        </button>
      </div>
    </div>
  );
};

export default ExamResultForm;
