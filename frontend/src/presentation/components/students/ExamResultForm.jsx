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
      exam_name: '',
      exam_date: '',
      subject: '',
      total_obtained: '',
      total_maximum: '',
      overall_grade: '',
      pass_fail: false,
      remarks: '',
    },
  });

  // Effect to reset the form when initialExamResult changes (e.g., when editing a different result)
  React.useEffect(() => {
    if (initialExamResult) {
      console.log('ExamResultForm: Initial exam result received:', initialExamResult);

      // Extract subject and marks from subject_scores array if it exists
      let subject = '';
      let total_obtained = '';
      let total_maximum = '';
      let overall_grade = '';
      let pass_fail = false;

      // Check if subject_scores or subjectScores exists and has data
      const subjectScores = initialExamResult.subject_scores || initialExamResult.subjectScores;

      if (subjectScores && subjectScores.length > 0) {
        const firstScore = subjectScores[0];
        console.log('ExamResultForm: Extracting from subject_scores/subjectScores:', firstScore);
        // Handle both snake_case and camelCase field names
        subject = firstScore.subject || '';
        total_obtained = firstScore.marks_obtained || firstScore.marksObtained || '';
        total_maximum = firstScore.total_marks || firstScore.totalMarks || '';
        overall_grade = firstScore.grade || '';
        pass_fail = firstScore.pass_status === 'pass' || firstScore.passStatus === 'pass';
      } else {
        // Fallback to old field structure or camelCase from model
        console.log('ExamResultForm: Using fallback for old field structure or camelCase');
        subject = initialExamResult.subject || '';
        total_obtained = initialExamResult.total_obtained || initialExamResult.totalObtained ||
                       initialExamResult.marks_obtained || '';
        total_maximum = initialExamResult.total_maximum || initialExamResult.totalMaximum ||
                       initialExamResult.total_marks || '';
        overall_grade = initialExamResult.overall_grade || initialExamResult.overallGrade ||
                       initialExamResult.grade || '';
        pass_fail = initialExamResult.pass_fail || initialExamResult.passStatus === 'pass' || false;
      }

      const resetData = {
        ...initialExamResult,
        academic_year: String(initialExamResult.academic_year?.id || initialExamResult.academicYear?.id ||
                             initialExamResult.academic_year || initialExamResult.academicYear || ''),
        class: String(initialExamResult.class?.id || initialExamResult.class || ''),
        exam_type: initialExamResult.exam_type || initialExamResult.examType || '',
        exam_name: initialExamResult.exam_name || initialExamResult.examName || '',
        exam_date: initialExamResult.exam_date || initialExamResult.examDate || '',
        subject: subject,
        total_obtained: total_obtained,
        total_maximum: total_maximum,
        overall_grade: overall_grade,
        pass_fail: pass_fail,
        remarks: initialExamResult.remarks || '',
      };
      console.log('ExamResultForm: Resetting form with data:', resetData);
      reset(resetData);
    } else {
      reset({
        academic_year: '',
        class: '',
        exam_type: '',
        exam_name: '',
        exam_date: '',
        subject: '',
        total_obtained: '',
        total_maximum: '',
        overall_grade: '',
        pass_fail: false,
        remarks: '',
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

    // Convert old format to new subject_scores component format
    const submissionData = {
      exam_type: data.exam_type,
      exam_name: data.exam_name,
      exam_date: data.exam_date,
      academic_year: data.academic_year ? parseInt(data.academic_year) : undefined,
      class: data.class ? parseInt(data.class) : undefined,
      student: studentId, // Link exam result to the student
      remarks: data.remarks,
      // Convert single subject to subject_scores array
      subject_scores: data.subject ? [{
        subject: data.subject,
        marks_obtained: parseFloat(data.total_obtained) || 0,
        total_marks: parseFloat(data.total_maximum) || 0,
        grade: data.overall_grade || '',
        pass_status: data.pass_fail ? 'pass' : 'fail'
      }] : [],
      ...(initialExamResult && { id: initialExamResult.id }), // Include ID if editing existing result
    };

    try {
      console.log('ExamResultForm: Submitting data:', submissionData);
      // saveExamResults expects an array, so wrap the single result
      const result = await saveExamResults(studentId, [submissionData]);
      if (result.success) {
        console.log('ExamResultForm: Save successful, calling onSaveSuccess.'); // NEW: Debug log
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onSaveSuccess(); // Close modal and refresh list in parent
        }, 1000);
      } else {
        console.error('ExamResultForm: Save failed:', result.error);
        const errorMessage = result.details
          ? `Failed to save exam result: ${JSON.stringify(result.details)}`
          : result.error || 'Failed to save exam result.';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error saving exam result:', err);
      setError('An unexpected error occurred while saving the exam result.');
    } finally {
      setLoading(false);
    }
  };

  // Watch marks to calculate percentage and grade automatically
  const totalObtained = watch('total_obtained');
  const totalMaximum = watch('total_maximum');

  useEffect(() => {
    if (totalObtained && totalMaximum && totalMaximum > 0) {
      const calcPercentage = ((totalObtained / totalMaximum) * 100).toFixed(2);
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
      setValue('overall_grade', calcGrade);
      setValue('overall_percentage', parseFloat(calcPercentage));
      setValue('pass_fail', calcPercentage >= 40);
    }
  }, [totalObtained, totalMaximum, setValue]);

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
                <option key={year.id} value={year.id}>{year.year}</option>
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
                <option key={cls.id} value={cls.id}>{cls.classname || cls.className}</option>
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

          {/* Exam Name */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-600" />
              Exam Name
            </label>
            <input
              type="text"
              {...register('exam_name')}
              className="w-full px-4 py-3 border-2 border-gray-300 hover:border-indigo-400 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Unit Test 1 - 2024"
            />
          </div>

          {/* Exam Date */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-600" />
              Exam Date
            </label>
            <input
              type="date"
              {...register('exam_date')}
              className="w-full px-4 py-3 border-2 border-gray-300 hover:border-indigo-400 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
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
                  {...register('total_obtained', {
                    required: 'Required',
                    min: { value: 0, message: 'Min 0' },
                    valueAsNumber: true
                  })}
                  className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.total_obtained ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="85"
                />
                {errors.total_obtained && (
                  <p className="mt-1 text-xs text-red-600">{errors.total_obtained.message}</p>
                )}
              </div>

              {/* Total Marks */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Total Marks</label>
                <input
                  type="number"
                  {...register('total_maximum', {
                    required: 'Required',
                    min: { value: 1, message: 'Min 1' },
                    valueAsNumber: true
                  })}
                  className={`w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.total_maximum ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="100"
                />
                {errors.total_maximum && (
                  <p className="mt-1 text-xs text-red-600">{errors.total_maximum.message}</p>
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
                <input type="hidden" {...register('overall_grade')} />
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

      {/* Remarks */}
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-600" />
          Remarks (Optional)
        </label>
        <textarea
          {...register('remarks')}
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-300 hover:border-indigo-400 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Any additional comments or observations about the student's performance..."
        />
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
