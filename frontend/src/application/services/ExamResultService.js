import { apiClient } from '../../data/api/config'; // Use your configured apiClient

export class ExamResultService {
  
  /**
   * Approve student for next stage
   * Backend endpoint: POST /api/exam-results/approve-student
   */
  async approveStudentForNextStage(studentId, examResultId = null) {
    try {
      const response = await apiClient.post('/exam-results/approve-student', {
        studentId,
        examResultId, // optional - for specific exam result approval
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error approving student for next stage:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  /**
   * Get all exam results with optional filtering
   * Backend endpoint: GET /api/exam-results
   */
  async getAllExamResults(filters = {}) {
    try {
      // Build query parameters for Strapi filtering
      const params = {};
      
      // Add filters in Strapi format
      if (filters.studentId) {
        params['filters[student][id][$eq]'] = filters.studentId;
      }
      if (filters.subject) {
        params['filters[subject][$eq]'] = filters.subject;
      }
      if (filters.examType) {
        params['filters[exam_type][$eq]'] = filters.examType;
      }
      if (filters.academicYear) {
        params['filters[academic_year][id][$eq]'] = filters.academicYear;
      }
      if (filters.classId) {
        params['filters[class][id][$eq]'] = filters.classId;
      }
      
      // Include relations
      params['populate[student]'] = 'true';
      params['populate[academic_year]'] = 'true';
      params['populate[class]'] = 'true';
      
      const response = await apiClient.get('/exam-results', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching exam results:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  /**
   * Get single exam result by ID
   * Backend endpoint: GET /api/exam-results/:id
   */
  async getExamResultById(id) {
    try {
      const response = await apiClient.get(`/exam-results/${id}?populate=*`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error fetching exam result with ID ${id}:`, error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }

  /**
   * Create new exam result
   * Backend endpoint: POST /api/exam-results
   */
  async createExamResult(examResultData) {
    try {
      // Wrap data in Strapi format
      const submissionData = {
        data: examResultData
      };
      
      const response = await apiClient.post('/exam-results', submissionData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating exam result:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message,
        details: error.response?.data?.error?.details || null
      };
    }
  }

  /**
   * Update existing exam result
   * Backend endpoint: PUT /api/exam-results/:id
   */
  async updateExamResult(id, examResultData) {
    try {
      // Wrap data in Strapi format
      const submissionData = {
        data: examResultData
      };
      
      const response = await apiClient.put(`/exam-results/${id}`, submissionData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error updating exam result with ID ${id}:`, error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message,
        details: error.response?.data?.error?.details || null
      };
    }
  }

  /**
   * Delete exam result
   * Backend endpoint: DELETE /api/exam-results/:id
   */
  async deleteExamResult(id) {
    try {
      await apiClient.delete(`/exam-results/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting exam result with ID ${id}:`, error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }

  /**
   * Bulk create/update exam results for a student
   * Backend endpoint: POST /api/exam-results/student/:studentId/bulk
   */
  async bulkCreateOrUpdateExamResults(studentId, examResults) {
    try {
      const response = await apiClient.post(
        `/exam-results/student/${studentId}/bulk`, 
        { examResults }
      );
      console.log('ExamResultService.bulkCreateOrUpdateExamResults - API Response:', response);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`ExamResultService.bulkCreateOrUpdateExamResults - API Error for student ${studentId}:`, error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message,
        details: error.response?.data?.error?.details || null
      };
    }
  }

  /**
   * Get student performance analytics
   * Backend endpoint: GET /api/exam-results/student/:studentId/performance
   */
  async getStudentPerformance(studentId, filters = {}) {
    try {
      const params = {};
      
      if (filters.academicYear) {
        params.academicYear = filters.academicYear;
      }
      if (filters.classId) {
        params.classId = filters.classId;
      }
      
      const response = await apiClient.get(
        `/exam-results/student/${studentId}/performance`,
        { params }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error fetching performance for student ${studentId}:`, error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }

  /**
   * Get exam results for a specific student (filtered version of getAllExamResults)
   */
  async getStudentExamResults(studentId, filters = {}) {
    return this.getAllExamResults({ 
      studentId, 
      ...filters 
    });
  }

  /**
   * Get exam results by subject
   */
  async getExamResultsBySubject(subject, filters = {}) {
    return this.getAllExamResults({ 
      subject, 
      ...filters 
    });
  }

  /**
   * Get exam results by exam type
   */
  async getExamResultsByExamType(examType, filters = {}) {
    return this.getAllExamResults({ 
      examType, 
      ...filters 
    });
  }

  /**
   * Get exam results for a class
   */
  async getClassExamResults(classId, filters = {}) {
    return this.getAllExamResults({ 
      classId, 
      ...filters 
    });
  }

  // Legacy method for backward compatibility
  async createOrUpdateExamResults(studentId, examResults) {
    console.warn('createOrUpdateExamResults is deprecated. Use bulkCreateOrUpdateExamResults instead.');
    return this.bulkCreateOrUpdateExamResults(studentId, examResults);
  }
}