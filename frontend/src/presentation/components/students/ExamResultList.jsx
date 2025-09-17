import React from 'react';

const ExamResultList = ({ examResults, onEdit, onDelete }) => {
  if (!examResults || examResults.length === 0) {
    return <p className="text-gray-600">No exam results found for this student.</p>;
  }

  return (
    <div className="space-y-4">
      {examResults.map((result, index) => (
        <div key={result.id || index} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
          <h5 className="text-md font-semibold text-gray-800 mb-2">Exam: {result.exam_type} - {result.subject}</h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-700">
            <p><strong>Academic Year:</strong> {result.academic_year?.code || result.academic_year}</p>
            <p><strong>Class:</strong> {result.class?.classname || result.class}</p>
            <p><strong>Marks:</strong> {result.marks_obtained} / {result.total_marks}</p>
            <p><strong>Grade:</strong> {result.grade || 'N/A'}</p>
            <p><strong>Status:</strong> {result.pass_fail ? 'Pass' : 'Fail'}</p>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(result)}
                className="btn-icon text-indigo-600 hover:text-indigo-800"
                aria-label="Edit exam result"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(result.id)}
                className="btn-icon text-red-600 hover:text-red-800"
                aria-label="Delete exam result"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExamResultList;
