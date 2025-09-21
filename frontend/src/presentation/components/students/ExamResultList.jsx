import React from 'react';
import { Edit, Trash2, Award, Calendar, BookOpen, Trophy, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

const ExamResultList = ({ examResults, onEdit, onDelete }) => {
  const [expandedResults, setExpandedResults] = React.useState({});

  console.log('ExamResultList - Rendering exam results:', examResults);

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

  const toggleExpanded = (resultId) => {
    setExpandedResults(prev => ({
      ...prev,
      [resultId]: !prev[resultId]
    }));
  };

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
    if (!total || total === 0) return 0;
    return ((obtained / total) * 100).toFixed(1);
  };

  const getPercentageColor = (percentage) => {
    const p = parseFloat(percentage);
    if (p >= 80) return 'text-green-600';
    if (p >= 60) return 'text-blue-600';
    if (p >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPassStatusIcon = (status) => {
    if (status === 'pass' || status === true) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (status === 'fail' || status === false) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
    return <div className="h-4 w-4 rounded-full bg-gray-300" />;
  };

  const getPassStatusText = (status) => {
    if (status === 'pass' || status === true) return 'Pass';
    if (status === 'fail' || status === false) return 'Fail';
    if (status === 'absent') return 'Absent';
    return 'Pending';
  };

  return (
    <div className="space-y-4">
      {examResults.map((result, index) => {
        const isExpanded = expandedResults[result.id || index];

        // Determine if this is multi-subject or single-subject
        const isMultiSubject = result.subject_scores && result.subject_scores.length > 0;
        const subjectCount = isMultiSubject ? result.subject_scores.length : 1;

        // Calculate overall percentage
        let percentage, totalObtained, totalMaximum, overallGrade, passStatus;

        // Strapi 5 structure - use the new field names
        if (result.total_obtained !== undefined || result.overall_percentage !== undefined) {
          // New Strapi 5 format
          totalObtained = result.total_obtained || 0;
          totalMaximum = result.total_maximum || 100;
          percentage = result.overall_percentage || getPercentage(totalObtained, totalMaximum);
          overallGrade = result.overall_grade || '';
          passStatus = result.pass_status;
        } else {
          // Fallback for old field names
          totalObtained = result.marks_obtained || 0;
          totalMaximum = result.total_marks || 100;
          percentage = getPercentage(totalObtained, totalMaximum);
          overallGrade = result.grade || '';
          passStatus = result.pass_fail;
        }

        const percentageColor = getPercentageColor(percentage);

        // Display name - prioritize exam_name, then exam_type, then subject
        const displayName = result.exam_name || result.exam_type || result.subject || 'Exam Result';

        return (
          <div
            key={result.id || index}
            className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-indigo-300"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg font-bold text-gray-800">
                      {displayName}
                    </h5>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      {result.exam_type && (
                        <>
                          <span className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {result.exam_type}
                          </span>
                        </>
                      )}
                      {result.exam_date && (
                        <>
                          {result.exam_type && <span className="text-gray-400">•</span>}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(result.exam_date).toLocaleDateString()}
                          </span>
                        </>
                      )}
                      {(result.academic_year || result.class) && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>
                            {result.academic_year?.code || result.academic_year?.name || ''}
                            {result.class && ` • Class ${result.class?.classname || result.class?.name || ''}`}
                          </span>
                        </>
                      )}
                      {isMultiSubject && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="font-medium text-indigo-600">
                            {subjectCount} {subjectCount === 1 ? 'Subject' : 'Subjects'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {isMultiSubject && (
                    <button
                      onClick={() => toggleExpanded(result.id || index)}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ?
                        <ChevronUp className="h-5 w-5 text-gray-600" /> :
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      }
                    </button>
                  )}
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

            {/* Card Body - Overall Statistics */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Score */}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-semibold mb-1">
                    {isMultiSubject ? 'Total Score' : 'Score'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-800">
                      {totalObtained}
                    </span>
                    <span className="text-lg text-gray-500">
                      / {totalMaximum}
                    </span>
                  </div>
                </div>

                {/* Percentage */}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-semibold mb-1">Percentage</span>
                  <span className={`text-2xl font-bold ${percentageColor}`}>
                    {!isNaN(percentage) ? `${percentage}%` : 'N/A'}
                  </span>
                </div>

                {/* Grade */}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-semibold mb-1">
                    {isMultiSubject ? 'Overall Grade' : 'Grade'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getGradeColor(overallGrade)} inline-block self-start`}>
                    {overallGrade || 'N/A'}
                  </span>
                </div>

                {/* Status */}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-semibold mb-1">Status</span>
                  <div className="flex items-center gap-2">
                    {getPassStatusIcon(passStatus)}
                    <span className={`font-semibold ${
                      passStatus === 'pass' || passStatus === true ? 'text-green-600' :
                      passStatus === 'fail' || passStatus === false ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {getPassStatusText(passStatus)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject-wise breakdown (expandable) */}
              {isMultiSubject && isExpanded && result.subject_scores && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h6 className="text-sm font-semibold text-gray-700 mb-3">Subject-wise Performance</h6>
                  <div className="space-y-2">
                    {result.subject_scores.map((score, scoreIndex) => {
                      const subjectPercentage = getPercentage(
                        score.marksObtained || score.marks_obtained,
                        score.totalMarks || score.total_marks
                      );
                      return (
                        <div key={scoreIndex} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            <span className="font-medium text-gray-700">{score.subject}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                              {score.marksObtained || score.marks_obtained || 0} / {score.totalMarks || score.total_marks || 0}
                            </span>
                            <span className={`font-semibold ${getPercentageColor(subjectPercentage)}`}>
                              {!isNaN(subjectPercentage) ? `${subjectPercentage}%` : 'N/A'}
                            </span>
                            {score.grade && (
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${getGradeColor(score.grade)}`}>
                                {score.grade}
                              </span>
                            )}
                            {getPassStatusIcon(score.passStatus || score.pass_status)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Remarks */}
              {result.remarks && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Remarks</span>
                  <p className="text-sm text-gray-700 mt-1">{result.remarks}</p>
                </div>
              )}

              {/* Rank Badge */}
              {result.rank && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-700">Rank: {result.rank}</span>
                </div>
              )}

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