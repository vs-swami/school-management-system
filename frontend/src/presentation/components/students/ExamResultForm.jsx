import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { BookOpen, GraduationCap, Award, Calculator, Hash, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import useStudentStore from '../../../application/stores/useStudentStore';

const ExamResultForm = ({ studentId, academicYears, classes, initialExamResult, onSaveSuccess, onCancel }) => {
  const { saveExamResults, loading, setLoading, error, setError } = useStudentStore();
  const [percentage, setPercentage] = useState(0);
  const [grade, setGrade] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
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

  // Watch marks to calculate percentage and grade automatically
  const marksObtained = watch('marks_obtained');
  const totalMarks = watch('total_marks');

  useEffect(() => {
    if (marksObtained && totalMarks && totalMarks > 0) {
      const calcPercentage = ((marksObtained / totalMarks) * 100).toFixed(2);
      setPercentage(calcPercentage);

      // Auto-calculate grade based on percentage
      let calcGrade = '';
      if (calcPercentage >= 90) calcGrade = 'A+';
      else if (calcPercentage >= 80) calcGrade = 'A';
      else if (calcPercentage >= 70) calcGrade = 'B+';
      else if (calcPercentage >= 60) calcGrade = 'B';
      else if (calcPercentage >= 50) calcGrade = 'C';
      else if (calcPercentage >= 40) calcGrade = 'D';
      else calcGrade = 'F';

      setGrade(calcGrade);
      setValue('grade', calcGrade);
      setValue('pass_fail', calcPercentage >= 40);
    }
  }, [marksObtained, totalMarks, setValue]);

  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A+': return 'text-green-600 bg-green-50';
      case 'A': return 'text-green-500 bg-green-50';
      case 'B+': return 'text-blue-600 bg-blue-50';
      case 'B': return 'text-blue-500 bg-blue-50';
      case 'C': return 'text-yellow-600 bg-yellow-50';
      case 'D': return 'text-orange-600 bg-orange-50';
      case 'F': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3 animate-in slide-in-from-top duration-300">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Success Alert */}
      {showSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3 animate-in slide-in-from-top duration-300">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
          <span className="text-sm text-green-800">Exam result saved successfully!</span>
        </div>
      )}

      {/* Header with Score Display */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-3 rounded-full shadow-sm">
              <GraduationCap className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h5 className="text-xl font-bold text-gray-800">Exam Result Entry</h5>
              <p className="text-sm text-gray-600">Enter the student's exam performance details</p>
            </div>
          </div>
          {percentage > 0 && (
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{percentage}%</div>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-bold mt-1 ${getGradeColor(grade)}`}>
                Grade {grade}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Academic Year */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              Academic Year
            </label>
            <select
              {...register('academic_year', { required: 'Academic Year is required' })}
              className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.academic_year ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-400'
              }`}
            >
              <option value="">Select Academic Year</option>
              {academicYears.map(year => (
                <option key={year.id} value={year.id}>{year.code}</option>
              ))}
            </select>
            {errors.academic_year && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.academic_year.message}
              </p>
            )}
          </div>

          {/* Class */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-indigo-600" />
              Class
            </label>
            <select
              {...register('class', { required: 'Class is required' })}
              className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.class ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-400'
              }`}
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>Class {cls.classname}</option>
              ))}
            </select>
            {errors.class && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.class.message}
              </p>
            )}
          </div>

          {/* Exam Type */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-600" />
              Exam Type
            </label>
            <select
              {...register('exam_type', { required: 'Exam Type is required' })}
              className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.exam_type ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-400'
              }`}
            >
              <option value="">Select Exam Type</option>
              <option value="Unit Test 1">Unit Test 1</option>
              <option value="Unit Test 2">Unit Test 2</option>
              <option value="Mid Term">Mid Term</option>
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Annual">Annual</option>
              <option value="Entrance">Entrance</option>
            </select>
            {errors.exam_type && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.exam_type.message}
              </p>
            )}
          </div>

          {/* Subject */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              Subject
            </label>
            <select
              {...register('subject', { required: 'Subject is required' })}
              className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-400'
              }`}
            >
              <option value="">Select Subject</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Social Studies">Social Studies</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="History">History</option>
              <option value="Geography">Geography</option>
              <option value="Economics">Economics</option>
            </select>
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.subject.message}
              </p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Marks Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h6 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-indigo-600" />
              Marks Information
            </h6>

            <div className="grid grid-cols-2 gap-4">
              {/* Marks Obtained */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Marks Obtained</label>
                <input
                  type="number"
                  {...register('marks_obtained', {
                    required: 'Required',
                    min: { value: 0, message: 'Min 0' },
                    valueAsNumber: true
                  })}
                  className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.marks_obtained ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="85"
                />
                {errors.marks_obtained && (
                  <p className="mt-1 text-xs text-red-600">{errors.marks_obtained.message}</p>
                )}
              </div>

              {/* Total Marks */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Total Marks</label>
                <input
                  type="number"
                  {...register('total_marks', {
                    required: 'Required',
                    min: { value: 1, message: 'Min 1' },
                    valueAsNumber: true
                  })}
                  className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.total_marks ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="100"
                />
                {errors.total_marks && (
                  <p className="mt-1 text-xs text-red-600">{errors.total_marks.message}</p>
                )}
              </div>
            </div>

            {/* Percentage Display */}
            {percentage > 0 && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Percentage</span>
                  <span className="text-lg font-bold text-indigo-600">{percentage}%</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      percentage >= 80 ? 'bg-green-500' :
                      percentage >= 60 ? 'bg-blue-500' :
                      percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Grade and Status */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h6 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-600" />
              Grade & Status
            </h6>

            <div className="space-y-3">
              {/* Grade Display */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Grade (Auto-calculated)</label>
                <div className={`px-4 py-3 rounded-lg text-center font-bold text-lg ${getGradeColor(grade || 'N/A')}`}>
                  {grade || 'N/A'}
                </div>
                <input type="hidden" {...register('grade')} />
              </div>

              {/* Pass/Fail Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Status</label>
                <div className="flex items-center justify-center gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="true"
                      {...register('pass_fail')}
                      className="sr-only"
                      checked={watch('pass_fail') === true}
                    />
                    <div className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      watch('pass_fail') === true
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : 'bg-white border-gray-300 text-gray-500'
                    }`}>
                      <CheckCircle className="h-5 w-5 inline mr-1" />
                      Pass
                    </div>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="false"
                      {...register('pass_fail')}
                      className="sr-only"
                      checked={watch('pass_fail') === false}
                    />
                    <div className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      watch('pass_fail') === false
                        ? 'bg-red-100 border-red-500 text-red-700'
                        : 'bg-white border-gray-300 text-gray-500'
                    }`}>
                      <AlertCircle className="h-5 w-5 inline mr-1" />
                      Fail
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5" />
              Save Exam Result
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExamResultForm;
