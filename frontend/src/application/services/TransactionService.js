import { TransactionRepositoryAdapter } from '../../data/adapters/TransactionRepositoryAdapter';

export class TransactionService {
  constructor() {
    this.repository = new TransactionRepositoryAdapter();
  }

  async processFeePayment(paymentData) {
    try {
      // Validate payment data
      const validation = this.validatePaymentData(paymentData);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      const transaction = await this.repository.processFeePayment(paymentData);
      return {
        success: true,
        data: transaction,
        message: 'Payment processed successfully'
      };
    } catch (error) {
      console.error('Error in TransactionService.processFeePayment:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to process payment';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async processBatchPayment(paymentData) {
    try {
      // Validate batch payment data
      if (!paymentData.itemIds || paymentData.itemIds.length === 0) {
        return {
          success: false,
          error: 'No payment items selected'
        };
      }

      if (!paymentData.paymentMethod) {
        return {
          success: false,
          error: 'Payment method is required'
        };
      }

      const result = await this.repository.processBatchPayment(paymentData);
      return {
        success: true,
        data: result,
        message: 'Batch payment processed successfully'
      };
    } catch (error) {
      console.error('Error in TransactionService.processBatchPayment:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to process batch payment';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getDailyCollection(date = null) {
    try {
      const collection = await this.repository.getDailyCollection(date);
      return {
        success: true,
        data: collection
      };
    } catch (error) {
      console.error('Error in TransactionService.getDailyCollection:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to fetch daily collection';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getStudentTransactions(studentId) {
    try {
      const transactions = await this.repository.findByStudent(studentId);
      return {
        success: true,
        data: transactions
      };
    } catch (error) {
      console.error('Error in TransactionService.getStudentTransactions:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to fetch student transactions';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getReceipt(transactionId) {
    try {
      const receipt = await this.repository.getReceipt(transactionId);
      return {
        success: true,
        data: receipt
      };
    } catch (error) {
      console.error('Error in TransactionService.getReceipt:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to fetch receipt';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getAllTransactions(filters = {}) {
    try {
      const transactions = await this.repository.findAll(filters);
      return {
        success: true,
        data: transactions
      };
    } catch (error) {
      console.error('Error in TransactionService.getAllTransactions:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to fetch transactions';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getTransactionById(id) {
    try {
      const transaction = await this.repository.findById(id);
      return {
        success: true,
        data: transaction
      };
    } catch (error) {
      console.error('Error in TransactionService.getTransactionById:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to fetch transaction';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async createTransaction(transactionData) {
    try {
      const transaction = await this.repository.create(transactionData);
      return {
        success: true,
        data: transaction,
        message: 'Transaction created successfully'
      };
    } catch (error) {
      console.error('Error in TransactionService.createTransaction:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to create transaction';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async updateTransaction(id, transactionData) {
    try {
      const transaction = await this.repository.update(id, transactionData);
      return {
        success: true,
        data: transaction,
        message: 'Transaction updated successfully'
      };
    } catch (error) {
      console.error('Error in TransactionService.updateTransaction:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to update transaction';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getStudentFinanceTransactions(filters = {}) {
    try {
      const transactions = await this.repository.getStudentFinanceTransactions(filters);
      return {
        success: true,
        data: transactions
      };
    } catch (error) {
      console.error('Error in TransactionService.getStudentFinanceTransactions:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to fetch student finance transactions';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Validation helper
  validatePaymentData(paymentData) {
    if (!paymentData.scheduleId) {
      return { valid: false, error: 'Schedule ID is required' };
    }

    if (!paymentData.paymentItemIds || paymentData.paymentItemIds.length === 0) {
      return { valid: false, error: 'At least one payment item must be selected' };
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      return { valid: false, error: 'Payment amount must be greater than 0' };
    }

    if (!paymentData.paymentMethod) {
      return { valid: false, error: 'Payment method is required' };
    }

    return { valid: true };
  }

  // Helper method to calculate collection statistics
  async getCollectionStatistics(startDate, endDate) {
    try {
      const filters = {
        filters: {
          transaction_date: {
            $gte: startDate,
            $lte: endDate
          },
          transaction_type: 'income',
          status: 'completed'
        }
      };

      const transactions = await this.repository.findAll(filters);

      const stats = {
        totalCollection: 0,
        transactionCount: transactions.length,
        byCategory: {},
        byPaymentMethod: {},
        dailyAverage: 0
      };

      transactions.forEach(txn => {
        stats.totalCollection += txn.amount;

        // By category
        if (!stats.byCategory[txn.transactionCategory]) {
          stats.byCategory[txn.transactionCategory] = 0;
        }
        stats.byCategory[txn.transactionCategory] += txn.amount;

        // By payment method
        if (!stats.byPaymentMethod[txn.paymentMethod]) {
          stats.byPaymentMethod[txn.paymentMethod] = 0;
        }
        stats.byPaymentMethod[txn.paymentMethod] += txn.amount;
      });

      // Calculate daily average
      const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
      stats.dailyAverage = days > 0 ? stats.totalCollection / days : 0;

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error in TransactionService.getCollectionStatistics:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to calculate collection statistics';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}