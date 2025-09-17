import { apiClient } from '../api/config';

export class StudentDocumentRepository {
  static async create(studentId, documentType, file, description = null) {
    try {
      const formData = new FormData();
      formData.append('files', file);

      const dataPayload = {
        document_type: documentType,
        student: studentId,
        ...(description && { description }),
      };

      formData.append('data', JSON.stringify(dataPayload));

      // Use the correct endpoint
      const response = await apiClient.post('/student-documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('StudentDocumentRepository Error in create:', error.response?.data || error);
      throw error;
    }
  }

  static async update(documentId, studentId, documentType, file, description = null) {
    try {
      const formData = new FormData();
      formData.append('files', file);

      const dataPayload = {
        document_type: documentType,
        student: studentId,
        ...(description && { description }),
      };

      formData.append('data', JSON.stringify(dataPayload));

      const response = await apiClient.put(`/student-documents/${documentId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('StudentDocumentRepository Error in update:', error.response?.data || error);
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

  // Alternative method if single-step upload works for your backend
  static async createSingleStep(studentId, documentType, file, description = null) {
    try {
      const formData = new FormData();

      // Append file with nested field name
      formData.append('files.file', file);

      // Append other fields directly (not as JSON)
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
      return response.data.data;
    } catch (error) {
      console.error('StudentDocumentRepository Error in createSingleStep:', error.response?.data || error);
      throw error;
    }
  }
}