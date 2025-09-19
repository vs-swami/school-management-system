import React from 'react';
import { Edit, Trash2, Award, Calendar, BookOpen, TrendingUp, CheckCircle, XCircle, MoreVertical } from 'lucide-react';

const ExamResultList = ({ examResults, onEdit, onDelete }) => {
  if (!examResults || examResults.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <BookOpen className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium">No exam results found</p>
        <p className="text-gray-500 text-sm mt-1">Click "Add Exam Result" to start recording academic performance</p>
      </div>
    );
  }

  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A+': return 'bg-green-100 text-green-700 border-green-300';
      case 'A': return 'bg-green-50 text-green-600 border-green-200';
      case 'B+': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'B': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'D': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'F': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPercentage = (obtained, total) => {
    if (total === 0) return 0;
    return ((obtained / total) * 100).toFixed(1);
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {examResults.map((result, index) => {
        const percentage = getPercentage(result.marks_obtained, result.total_marks);
        const percentageColor = getPercentageColor(percentage);

        return (
          <div
            key={result.id || index}
            className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-indigo-300"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h5 className="text-lg font-bold text-gray-800">
                      {result.subject}
                    </h5>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {result.exam_type}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {result.academic_year?.code || result.academic_year}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>Class {result.class?.classname || result.class}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(result)}
                      className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg transition-colors"
                      aria-label="Edit exam result"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(result.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                      aria-label="Delete exam result"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Marks Section */}
                <div className="flex items-center justify-between md:justify-start gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {result.marks_obtained}/{result.total_marks}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Percentage</p>
                    <p className={`text-2xl font-bold ${percentageColor}`}>
                      {percentage}%
                    </p>
                  </div>
                </div>

                {/* Grade Section */}
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Grade</p>
                    <span className={`inline-flex px-6 py-2 rounded-full text-lg font-bold border-2 ${getGradeColor(result.grade || 'N/A')}`}>
                      {result.grade || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Status Section */}
                <div className="flex items-center justify-center md:justify-end">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Status</p>
                    {result.pass_fail ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold">
                        <CheckCircle className="h-5 w-5" />
                        <span>PASS</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full font-semibold">
                        <XCircle className="h-5 w-5" />
                        <span>FAIL</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      percentage >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                      percentage >= 60 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                      percentage >= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                      'bg-gradient-to-r from-red-400 to-red-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExamResultList;
