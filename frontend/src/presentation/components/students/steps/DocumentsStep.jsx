import React from 'react';
import { AlertCircle, CheckCircle, FileText } from 'lucide-react';
import DocumentUploadForm from '../DocumentUploadForm';
import { useDocumentManagement } from '../../../hooks/useDocumentManagement';

const DocumentsStep = ({ skipDocuments, onSkipToggle, studentId, documents = [], setValue, watch, getValues }) => {
  const {
    handleAddDocument,
    handleUpdateDocument,
    handleDeleteDocument,
    documentError,
    uploadSuccess,
    loading,
    clearMessages,
  } = useDocumentManagement(studentId, setValue, getValues);

  const watchedDocuments = watch ? watch('documents', []) : documents;

  return (
  <div className="space-y-6">
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="text-md font-semibold text-gray-800 mb-2">Document Uploads</h4>
      <p className="text-sm text-gray-600 mb-4">You can upload student documents now or skip this step and add them later.</p>

      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="skipDocuments"
          checked={skipDocuments}
          onChange={(e) => onSkipToggle(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
        />
        <label htmlFor="skipDocuments" className="text-sm font-medium text-gray-700">
          Skip document uploads for now
        </label>
        {skipDocuments && (
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Documents will be skipped
          </span>
        )}
      </div>

      {skipDocuments && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Documents Skipped</h4>
              <p className="mt-1 text-sm text-yellow-700">You can add documents later by editing the student record.</p>
            </div>
          </div>
        </div>
      )}
    </div>

    {!skipDocuments && (
      <div className="space-y-6">
        {/* Success/Error Messages */}
        {uploadSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-green-800">Document Uploaded Successfully</h4>
                <p className="mt-1 text-sm text-green-700">Your document has been uploaded and saved.</p>
              </div>
            </div>
          </div>
        )}

        {documentError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Upload Error</h4>
                <p className="mt-1 text-sm text-red-700">{documentError}</p>
              </div>
            </div>
          </div>
        )}


        {/* Document Upload Form */}
        {studentId ? (
          <DocumentUploadForm
            onAddDocument={handleAddDocument}
            onUpdateDocument={handleUpdateDocument}
            onDeleteDocument={handleDeleteDocument}
            existingDocuments={watchedDocuments}
            studentId={studentId}
            loading={loading}
          />
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-blue-400 mb-4" />
            <h4 className="text-lg font-semibold text-blue-800 mb-2">Save Student First</h4>
            <p className="text-blue-600">
              Please save the student information in the previous step before uploading documents.
            </p>
          </div>
        )}
      </div>
    )}
  </div>
  );
};

export default DocumentsStep;