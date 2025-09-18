import { useState } from 'react';
import useStudentStore from '../../application/stores/useStudentStore';

export const useDocumentManagement = (studentId, setValue, getValues) => {
  const { uploadStudentDocument, updateStudentDocument, deleteStudentDocument, loading } = useStudentStore();
  const [documentError, setDocumentError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleAddDocument = async (studentId, documentType, file, description) => {
    console.log('useDocumentManagement - handleAddDocument: START', { studentId, documentType, fileName: file?.name, description });
    try {
      setDocumentError('');
      setUploadSuccess(false);

      console.log('useDocumentManagement - handleAddDocument: Calling uploadStudentDocument');
      const result = await uploadStudentDocument(studentId, documentType, file, description);
      console.log('useDocumentManagement - handleAddDocument: uploadStudentDocument result:', result);

      if (result.success) {
        console.log('useDocumentManagement - handleAddDocument: Upload successful');
        setUploadSuccess(true);

        // Update the form's documents array if setValue is provided
        if (setValue && result.data && getValues) {
          const currentDocuments = getValues('documents') || [];
          const newDocument = {
            id: result.data.id,
            document_type: documentType,
            description: description || '',
            file: null,
            url: result.data.url || null,
          };

          console.log('useDocumentManagement - handleAddDocument: Updating form documents');
          setValue('documents', [...currentDocuments, newDocument]);
        }

        // Reset success message after 3 seconds
        setTimeout(() => setUploadSuccess(false), 3000);

        return { success: true, data: result.data };
      } else {
        console.log('useDocumentManagement - handleAddDocument: Upload failed:', result);
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('useDocumentManagement - handleAddDocument: Error:', error);
      setDocumentError(error.message || 'Failed to upload document');
      return { success: false, error: error.message };
    }
  };

  const handleUpdateDocument = async (documentId, studentId, documentType, file, description) => {
    try {
      setDocumentError('');
      setUploadSuccess(false);

      const result = await updateStudentDocument(documentId, studentId, documentType, file, description);

      if (result.success) {
        setUploadSuccess(true);

        // Update the form's documents array if setValue is provided
        if (setValue && result.data && getValues) {
          const currentDocuments = getValues('documents') || [];
          const updatedDocuments = currentDocuments.map(doc =>
            doc.id === documentId
              ? {
                  ...doc,
                  document_type: documentType,
                  description: description || '',
                  url: result.data.url || doc.url,
                }
              : doc
          );
          setValue('documents', updatedDocuments);
        }

        setTimeout(() => setUploadSuccess(false), 3000);

        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || 'Update failed');
      }
    } catch (error) {
      console.error('Document update error:', error);
      setDocumentError(error.message || 'Failed to update document');
      return { success: false, error: error.message };
    }
  };

  const handleDeleteDocument = async (documentId, studentId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this document?')) {
        return { success: false, cancelled: true };
      }

      setDocumentError('');

      const result = await deleteStudentDocument(documentId, studentId);

      if (result.success) {
        // Update the form's documents array if setValue is provided
        if (setValue && getValues) {
          const currentDocuments = getValues('documents') || [];
          setValue('documents', currentDocuments.filter(doc => doc.id !== documentId));
        }

        return { success: true };
      } else {
        throw new Error(result.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Document delete error:', error);
      setDocumentError(error.message || 'Failed to delete document');
      return { success: false, error: error.message };
    }
  };

  const clearMessages = () => {
    setDocumentError('');
    setUploadSuccess(false);
  };

  return {
    handleAddDocument,
    handleUpdateDocument,
    handleDeleteDocument,
    documentError,
    uploadSuccess,
    loading,
    clearMessages,
  };
};