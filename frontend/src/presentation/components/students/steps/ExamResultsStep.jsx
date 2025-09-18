import React from 'react';
import { PlusCircle } from 'lucide-react';
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
}) => (
  <div className="space-y-6">
    <h4 className="text-md font-semibold text-gray-800 mb-4">Exam Results Screening</h4>
    <p className="text-gray-600">This section allows you to manage exam results for the student. Add new results or edit/delete existing ones.</p>

    <button type="button" onClick={onAddExamResult} className="btn btn-primary-outline mb-4">
      <PlusCircle className="h-5 w-5 mr-2" /> Add New Exam Result
    </button>

    <ExamResultList examResults={watchedExamResults} onEdit={onEditExamResult} onDelete={onDeleteExamResult} />

    <Modal
      isOpen={isExamResultFormModalOpen}
      onClose={() => onCloseExamResultModal(false)}
      title={editingExamResult ? 'Edit Exam Result' : 'Add New Exam Result'}
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

    <div className="flex justify-end mt-6 space-x-4">
      <button
        type="button"
        onClick={() => onApproveNextStage(localStudentId)}
        className="btn btn-primary"
      >
        Approve for Next Stage
      </button>
      <button
        type="button"
        onClick={onRejectStudent}
        className="btn btn-danger-outline"
      >
        Reject Student
      </button>
    </div>
  </div>
);

export default ExamResultsStep;