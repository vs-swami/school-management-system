import { useState } from 'react';
import useStudentStore from '../../application/stores/useStudentStore';
import { extractExamResultsData } from '../../application/utils/studentFormUtils';

export const useExamResultsHandlers = (localStudentId, setValue, setCurrentStep, setIsStudentRejected, setIsSuccess, STEPS) => {
  const { approveNextStage, fetchStudentById, rejectStudent, fetchExamResultsForStudent } = useStudentStore();
  const [isExamResultFormModalOpen, setIsExamResultFormModalOpen] = useState(false);
  const [editingExamResult, setEditingExamResult] = useState(null);

  const onAddExamResult = () => {
    setEditingExamResult(null);
    setIsExamResultFormModalOpen(true);
  };

  const onEditExamResult = (examResult) => {
    setEditingExamResult(examResult);
    setIsExamResultFormModalOpen(true);
  };

  const onDeleteExamResult = async (examResultId) => {
    // Implement delete logic
  };

  const onApproveNextStage = async (studentId) => {
    const result = await approveNextStage(studentId);
    if (result.success) {
      if (setIsSuccess) setIsSuccess(true);
      await fetchStudentById(studentId);
      setCurrentStep(STEPS.ADMINISTRATION);
    }
  };

  const onRejectStudent = async () => {
    if (window.confirm('Are you sure you want to reject this student?')) {
      const result = await rejectStudent(localStudentId);
      if (result.success) {
        if (setIsSuccess) setIsSuccess(true);
        setCurrentStep(STEPS.ADMINISTRATION);
        setIsStudentRejected(true);
      }
    }
  };

  const onCloseExamResultModal = (shouldRefresh = false) => {
    setIsExamResultFormModalOpen(false);
    setEditingExamResult(null);
    if (shouldRefresh && localStudentId) {
      // Refresh exam results
      fetchExamResultsForStudent(localStudentId).then(result => {
        if (result.success) {
          const formattedExamResults = extractExamResultsData(result.data);
          setValue('exam_results', formattedExamResults);
        }
      });
    }
  };

  return {
    isExamResultFormModalOpen,
    editingExamResult,
    onAddExamResult,
    onEditExamResult,
    onDeleteExamResult,
    onApproveNextStage,
    onRejectStudent,
    onCloseExamResultModal,
  };
};