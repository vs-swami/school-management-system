import { apiClient } from '../api/config';

export const StudentWalletRepository = {
  async findByStudent(studentId) {
    try {
      const response = await apiClient.get(`/student-wallets/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet by student:', error);
      throw error;
    }
  },

  async topup(walletId, topupData) {
    try {
      const response = await apiClient.post(`/student-wallets/${walletId}/topup`, topupData);
      return response.data;
    } catch (error) {
      console.error('Error processing wallet topup:', error);
      throw error;
    }
  },

  async purchase(walletId, purchaseData) {
    try {
      const response = await apiClient.post(`/student-wallets/${walletId}/purchase`, purchaseData);
      return response.data;
    } catch (error) {
      console.error('Error processing wallet purchase:', error);
      throw error;
    }
  },

  async getTransactions(walletId, filters = {}) {
    try {
      const response = await apiClient.get(`/student-wallets/${walletId}/transactions`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      throw error;
    }
  },

  async getStatement(walletId, startDate, endDate) {
    try {
      const response = await apiClient.get(`/student-wallets/${walletId}/statement`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet statement:', error);
      throw error;
    }
  },

  async checkBalance(walletId) {
    try {
      const response = await apiClient.get(`/student-wallets/${walletId}/balance`);
      return response.data;
    } catch (error) {
      console.error('Error checking wallet balance:', error);
      throw error;
    }
  },

  async getAllActive() {
    try {
      const response = await apiClient.get('/student-wallets/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active wallets:', error);
      throw error;
    }
  },

  async bulkTopup(wallets) {
    try {
      const response = await apiClient.post('/student-wallets/bulk-topup', { wallets });
      return response.data;
    } catch (error) {
      console.error('Error processing bulk topup:', error);
      throw error;
    }
  },

  async findAll(filters = {}) {
    try {
      const params = {
        populate: [
          'student',
          'student.enrollments',
          'student.enrollments.class',
          'wallet_transactions'
        ],
        ...filters
      };

      const response = await apiClient.get('/student-wallets', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching student wallets:', error);
      throw error;
    }
  },

  async findById(id) {
    try {
      const params = {
        populate: [
          'student',
          'student.enrollments',
          'student.enrollments.class',
          'student.enrollments.academic_year',
          'wallet_transactions',
          'wallet_transactions.transaction'
        ]
      };

      const response = await apiClient.get(`/student-wallets/${id}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet by ID:', error);
      throw error;
    }
  },

  async create(walletData) {
    try {
      const response = await apiClient.post('/student-wallets', { data: walletData });
      return response.data;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await apiClient.put(`/student-wallets/${id}`, { data });
      return response.data;
    } catch (error) {
      console.error('Error updating wallet:', error);
      throw error;
    }
  }
};