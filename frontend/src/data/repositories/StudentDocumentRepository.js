import { apiClient } from '../api/config';

export class StudentDocumentRepository {
  static async create(studentId, documentType, file, description = null) {
    try {
      console.log('StudentDocumentRepository - create: Starting upload', {
        studentId,
        documentType,
        fileName: file?.name,
        fileSize: file?.size,
        description
      });

      if (!studentId) {
        throw new Error('Student ID is required');
      }
      if (!file) {
        throw new Error('File is required');
      }
      if (!documentType) {
        throw new Error('Document type is required');
      }

      const formData = new FormData();

      // Use 'files' as the field name to match backend expectation
      formData.append('files', file);

      // The data should be structured as Strapi expects
      const dataPayload = {
        document_type: documentType,
        student: studentId,
        ...(description && { description }),
      };

      console.log('StudentDocumentRepository - create: Data payload', dataPayload);
      formData.append('data', JSON.stringify(dataPayload));

      const response = await apiClient.post('/student-documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('StudentDocumentRepository - create: Success response', response.data);
      return response.data;
    } catch (error) {
      console.error('StudentDocumentRepository Error in create:', error.response?.data || error);
      console.error('StudentDocumentRepository Error in create - Full error:', error);
      throw error;
    }
  }

  static async update(documentId, studentId, documentType, file, description = null) {
    try {
      console.log('StudentDocumentRepository - update: Starting update', {
        documentId,
        studentId,
        documentType,
        fileName: file?.name,
        description
      });

      const formData = new FormData();
      formData.append('files', file);

      const dataPayload = {
        document_type: documentType,
        student: studentId,
        ...(description && { description }),
      };

      console.log('StudentDocumentRepository - update: Data payload', dataPayload);
      formData.append('data', JSON.stringify(dataPayload));

      const response = await apiClient.put(`/student-documents/${documentId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('StudentDocumentRepository - update: Success response', response.data);
      return response.data;
    } catch (error) {
      console.error('StudentDocumentRepository Error in update:', error.response?.data || error);
      console.error('StudentDocumentRepository Error in update - Full error:', error);
      throw error;
    }
  }

  static async delete(documentId) {
    try {
      const response = await apiClient.delete(`/student-documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('StudentDocumentRepository Error in delete:', error.response?.data || error);
      throw error;
    }
  }

  // Alternative method for different backend configurations
  static async createSingleStep(studentId, documentType, file, description = null) {
    try {
      const formData = new FormData();

      // Separate field approach
      formData.append('file', file);
      formData.append('document_type', documentType);
      formData.append('student', studentId);
      if (description) {
        formData.append('description', description);
      }

      const response = await apiClient.post('/student-documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('StudentDocumentRepository Error in createSingleStep:', error.response?.data || error);
      throw error;
    }
  }
}