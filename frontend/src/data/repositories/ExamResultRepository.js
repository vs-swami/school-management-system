import { apiClient } from '../api/config';

export class ExamResultRepository {
  static async getStudentExamResults(studentId) {
    try {
      const response = await apiClient.get(`/exam-results`, {
        params: {
          filters: {
            student: {
              id: {
                $eq: studentId
              }
            }
          },
          populate: {
            subject_scores: '*',
            academic_year: '*',
            class: '*',
            student: '*'
          },
          sort: ['exam_date:desc', 'createdAt:desc']
        }
      });

      console.log('ExamResultRepository - Raw API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching student exam results:', error);
      throw error;
    }
  }

  static async createExamResult(examResultData) {
    try {
      const response = await apiClient.post('/exam-results', {
        data: examResultData
      });

      console.log('ExamResultRepository.createExamResult - Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating exam result:', error);
      throw error;
    }
  }

  static async updateExamResult(id, examResultData) {
    try {
      const response = await apiClient.put(`/exam-results/${id}`, {
        data: examResultData
      });

      console.log('ExamResultRepository.updateExamResult - Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating exam result:', error);
      throw error;
    }
  }

  static async deleteExamResult(id) {
    try {
      await apiClient.delete(`/exam-results/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting exam result:', error);
      throw error;
    }
  }

  static async getExamResultById(id) {
    try {
      const response = await apiClient.get(`/exam-results/${id}`, {
        params: {
          populate: {
            subject_scores: '*',
            student: '*',
            academic_year: '*',
            class: '*'
          }
        }
      });

      console.log('ExamResultRepository.getExamResultById - Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam result:', error);
      throw error;
    }
  }

  static async getClassExamResults(classId) {
    try {
      const response = await apiClient.get(`/exam-results`, {
        params: {
          filters: {
            class: {
              id: {
                $eq: classId
              }
            }
          },
          populate: {
            subject_scores: '*',
            student: '*',
            academic_year: '*'
          },
          sort: ['exam_date:desc', 'student.first_name:asc']
        }
      });

      console.log('ExamResultRepository.getClassExamResults - Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching class exam results:', error);
      throw error;
    }
  }

  static async bulkCreateExamResults(examResults) {
    try {
      const promises = examResults.map(result => this.createExamResult(result));
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Error in bulk creating exam results:', error);
      throw error;
    }
  }
}