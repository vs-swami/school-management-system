import React, { useMemo } from 'react';
import { PlusCircle, Trophy, TrendingUp, Award, BookOpen, CheckCircle, XCircle, AlertCircle, BarChart3 } from 'lucide-react';
import ExamResultForm from '../ExamResultForm';
import ExamResultList from '../ExamResultList';
import Modal from '../../common/Modal';

const ExamResultsStep = ({
  watchedExamResults,
  onAddExamResult,
  onEditExamResult,
  onDeleteExamResult,
  onApproveNextStage,
  onRejectStudent,
  localStudentId,
  isExamResultFormModalOpen,
  onCloseExamResultModal,
  editingExamResult,
  academicYears,
  classes,
  control,
  register,
  errors
}) => {
  // Calculate statistics from exam results
  const stats = useMemo(() => {
    if (!watchedExamResults || watchedExamResults.length === 0) {
      return {
        totalExams: 0,
        passed: 0,
        failed: 0,
        averagePercentage: 0,
        highestScore: 0,
        lowestScore: 100,
        passRate: 0
      };
    }

    const totalExams = watchedExamResults.length;

    // Use the correct field names from Strapi 5
    const percentages = watchedExamResults.map(r => {
      // Check for overall_percentage first (direct from API)
      if (r.overall_percentage !== undefined && r.overall_percentage !== null) {
        return parseFloat(r.overall_percentage);
      }
      // Fallback to calculating from total_obtained and total_maximum
      if (r.total_maximum > 0) {
        return ((r.total_obtained || 0) / r.total_maximum) * 100;
      }
      // Old field names fallback
      if (r.total_marks > 0) {
        return ((r.marks_obtained || 0) / r.total_marks) * 100;
      }
      return 0;
    });

    // Count passed exams based on grade or percentage
    const passed = watchedExamResults.filter(r => {
      const percentage = r.overall_percentage ||
                        (r.total_maximum > 0 ? (r.total_obtained / r.total_maximum) * 100 : 0) ||
                        (r.total_marks > 0 ? (r.marks_obtained / r.total_marks) * 100 : 0);
      return percentage >= 40 || r.pass_fail === true || ['A', 'B', 'C'].includes(r.overall_grade);
    }).length;
    const failed = totalExams - passed;

    const validPercentages = percentages.filter(p => p > 0);
    const averagePercentage = validPercentages.length > 0
      ? validPercentages.reduce((a, b) => a + b, 0) / validPercentages.length
      : 0;
    const highestScore = validPercentages.length > 0 ? Math.max(...validPercentages) : 0;
    const lowestScore = validPercentages.length > 0 ? Math.min(...validPercentages) : 0;
    const passRate = totalExams > 0 ? (passed / totalExams) * 100 : 0;

    return {
      totalExams,
      passed,
      failed,
      averagePercentage: averagePercentage.toFixed(1),
      highestScore: highestScore.toFixed(1),
      lowestScore: lowestScore.toFixed(1),
      passRate: passRate.toFixed(1)
    };
  }, [watchedExamResults]);

  const getPerformanceLevel = (percentage) => {
    if (percentage >= 80) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (percentage >= 60) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (percentage >= 40) return { level: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    return { level: 'Need Improvement', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const performance = getPerformanceLevel(stats.averagePercentage);

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-7 w-7" />
              Exam Results Screening
            </h4>
            <p className="text-indigo-100 mt-2">
              Review and manage student's academic performance
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-sm font-medium">Step 3 of 5</p>
            <div className="w-32 bg-white/30 rounded-full h-2 mt-1">
              <div className="bg-white h-2 rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {watchedExamResults && watchedExamResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Overall Performance Card */}
          <div className={`rounded-xl shadow-sm border-2 p-5 ${performance.bg} ${performance.border}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Performance</p>
                <p className={`text-2xl font-bold mt-1 ${performance.color}`}>
                  {stats.averagePercentage}%
                </p>
                <p className={`text-xs mt-1 ${performance.color}`}>
                  {performance.level}
                </p>
              </div>
              <div className={`p-3 rounded-full ${performance.bg}`}>
                <Trophy className={`h-6 w-6 ${performance.color}`} />
              </div>
            </div>
          </div>

          {/* Pass Rate Card */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.passRate}%
                </p>
                <div className="flex items-center gap-2 text-xs mt-1">
                  <span className="text-green-600">{stats.passed} passed</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-red-600">{stats.failed} failed</span>
                </div>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Highest Score Card */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Highest Score</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {stats.highestScore}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Best performance</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Exams Card */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalExams}
                </p>
                <p className="text-xs text-gray-500 mt-1">Results recorded</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Button */}
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-bold text-gray-800">Exam Results</h5>
        <button
          type="button"
          onClick={onAddExamResult}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <PlusCircle className="h-5 w-5" />
          Add Exam Result
        </button>
      </div>

      {/* Exam Results List */}
      <ExamResultList examResults={watchedExamResults} onEdit={onEditExamResult} onDelete={onDeleteExamResult} />

    <Modal
      isOpen={isExamResultFormModalOpen}
      onClose={() => onCloseExamResultModal(false)}
      title={editingExamResult ? 'Edit Exam Result' : 'Add New Exam Result'}
      size="xl"
    >
      <ExamResultForm
        academicYears={academicYears}
        classes={classes}
        control={control}
        register={register}
        errors={errors}
        studentId={localStudentId}
        initialExamResult={editingExamResult}
        onSaveSuccess={() => onCloseExamResultModal(true)}
        onCancel={() => onCloseExamResultModal(false)}
      />
    </Modal>

      {/* Action Buttons Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gray-600">Review Decision</p>
            <p className="text-xs text-gray-500 mt-1">Based on the exam results, make your decision</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onRejectStudent}
              className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg border-2 border-red-300 transition-all duration-200 flex items-center gap-2 hover:scale-105"
            >
              <XCircle className="h-5 w-5" />
              Reject Student
            </button>
            <button
              type="button"
              onClick={() => onApproveNextStage(localStudentId)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              Approve for Next Stage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamResultsStep;