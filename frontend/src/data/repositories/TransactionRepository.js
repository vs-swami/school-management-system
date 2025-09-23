import { apiClient } from '../api/config';

export const TransactionRepository = {
  async processFeePayment(paymentData) {
    try {
      const response = await apiClient.post('/transactions/fee-payment', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error processing fee payment:', error);
      throw error;
    }
  },

  async getDailyCollection(date) {
    try {
      const params = date ? { date } : {};
      const response = await apiClient.get('/transactions/daily-collection', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching daily collection:', error);
      throw error;
    }
  },

  async findByStudent(studentId) {
    try {
      const response = await apiClient.get(`/transactions/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student transactions:', error);
      throw error;
    }
  },

  async getReceipt(transactionId) {
    try {
      const response = await apiClient.get(`/transactions/${transactionId}/receipt`);
      return response.data;
    } catch (error) {
      console.error('Error fetching receipt:', error);
      throw error;
    }
  },

  async findAll(filters = {}) {
    try {
      const params = {
        populate: {
          payment_items: {
            populate: {
              payment_schedule: true,
              fee_definition: true
            }
          },
          expense_payment: true,
          wallet_transaction: true,
          processed_by: true
        },
        sort: { transaction_date: 'desc' },
        ...filters
      };

      const response = await apiClient.get('/transactions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  async findById(id) {
    try {
      const params = {
        populate: [
          'payment_items',
          'payment_items.payment_schedule',
          'payment_items.payment_schedule.enrollment',
          'payment_items.payment_schedule.enrollment.student',
          'payment_items.payment_schedule.enrollment.class',
          'payment_items.fee_definition',
          'expense_payment',
          'wallet_transaction',
          'processed_by'
        ]
      };

      const response = await apiClient.get(`/transactions/${id}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction by ID:', error);
      throw error;
    }
  },

  async create(transactionData) {
    try {
      const response = await apiClient.post('/transactions', { data: transactionData });
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await apiClient.put(`/transactions/${id}`, { data });
      return response.data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  async getStudentFinanceTransactions(filters = {}) {
    try {
      // Filter for student finance related transactions only
      const params = {
        filters: {
          transaction_category: {
            $in: ['student_fee', 'transport_fee', 'lab_fee', 'exam_fee', 'wallet_topup', 'wallet_deduction']
          },
          ...filters.filters
        },
        populate: {
          payment_items: {
            populate: {
              payment_schedule: {
                populate: {
                  enrollment: {
                    populate: {
                      student: true
                    }
                  }
                }
              },
              fee_definition: true
            }
          },
          wallet_transaction: true,
          processed_by: true
        },
        sort: { transaction_date: 'desc' },
        ...filters
      };

      const response = await apiClient.get('/transactions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching student finance transactions:', error);
      throw error;
    }
  },

  async processBatchPayment(paymentData) {
    try {
      const response = await apiClient.post('/payment-schedules/batch-payment', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error processing batch payment:', error);
      throw error;
    }
  }
};