import { apiClient } from '../api/config';

export const PaymentScheduleRepository = {
  async findByStudent(studentId) {
    try {
      const response = await apiClient.get(`/payment-schedules/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment schedules by student:', error);
      throw error;
    }
  },

  async findPending() {
    try {
      const response = await apiClient.get('/payment-schedules/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      throw error;
    }
  },

  async regenerate(enrollmentId, paymentPreference) {
    try {
      const response = await apiClient.post(`/payment-schedules/regenerate/${enrollmentId}`, {
        paymentPreference
      });
      return response.data;
    } catch (error) {
      console.error('Error regenerating payment schedule:', error);
      throw error;
    }
  },

  async getSummary(scheduleId) {
    try {
      const response = await apiClient.get(`/payment-schedules/${scheduleId}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedule summary:', error);
      throw error;
    }
  },

  async findAll(filters = {}) {
    try {
      const params = {
        populate: [
          'enrollment',
          'enrollment.student',
          'enrollment.class',
          'enrollment.academic_year',
          'payment_items',
          'payment_items.fee_definition'
        ],
        ...filters
      };

      const response = await apiClient.get('/payment-schedules', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment schedules:', error);
      throw error;
    }
  },

  async findById(id) {
    try {
      const params = {
        populate: [
          'enrollment',
          'enrollment.student',
          'enrollment.class',
          'enrollment.academic_year',
          'payment_items',
          'payment_items.fee_definition',
          'payment_items.transactions'
        ]
      };

      const response = await apiClient.get(`/payment-schedules/${id}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment schedule by ID:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await apiClient.put(`/payment-schedules/${id}`, { data });
      return response.data;
    } catch (error) {
      console.error('Error updating payment schedule:', error);
      throw error;
    }
  },

  async previewSchedule(enrollmentId) {
    try {
      const response = await apiClient.get(`/payment-schedules/enrollment/${enrollmentId}/preview`);
      return response.data;
    } catch (error) {
      console.error('Error previewing payment schedule:', error);
      throw error;
    }
  },

  async createSchedule(enrollmentId) {
    try {
      const response = await apiClient.post(`/payment-schedules/enrollment/${enrollmentId}/create`);
      return response.data;
    } catch (error) {
      console.error('Error creating payment schedule:', error);
      throw error;
    }
  }
};