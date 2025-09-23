import { StudentWalletRepositoryAdapter } from '../../data/adapters/StudentWalletRepositoryAdapter';

export class StudentWalletService {
  constructor() {
    this.repository = new StudentWalletRepositoryAdapter();
  }

  async getStudentWallet(studentId) {
    try {
      const wallet = await this.repository.findByStudent(studentId);
      return {
        success: true,
        data: wallet
      };
    } catch (error) {
      console.error('Error in StudentWalletService.getStudentWallet:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to fetch student wallet';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async processTopup(walletId, topupData) {
    try {
      // Validate topup data
      const validation = this.validateTopupData(topupData);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      const result = await this.repository.topup(walletId, topupData);
      return {
        success: true,
        data: result,
        message: 'Wallet topped up successfully'
      };
    } catch (error) {
      console.error('Error in StudentWalletService.processTopup:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to process wallet topup';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async processPurchase(walletId, purchaseData) {
    try {
      // Validate purchase data
      const validation = this.validatePurchaseData(purchaseData);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      const result = await this.repository.purchase(walletId, purchaseData);
      return {
        success: true,
        data: result,
        message: 'Purchase completed successfully'
      };
    } catch (error) {
      console.error('Error in StudentWalletService.processPurchase:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to process purchase';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getWalletTransactions(walletId, filters = {}) {
    try {
      const transactions = await this.repository.getTransactions(walletId, filters);
      return {
        success: true,
        data: transactions
      };
    } catch (error) {
      console.error('Error in StudentWalletService.getWalletTransactions:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to fetch wallet transactions';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getWalletStatement(walletId, startDate, endDate) {
    try {
      if (!startDate || !endDate) {
        return {
          success: false,
          error: 'Start date and end date are required'
        };
      }

      const statement = await this.repository.getStatement(walletId, startDate, endDate);
      return {
        success: true,
        data: statement
      };
    } catch (error) {
      console.error('Error in StudentWalletService.getWalletStatement:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to generate wallet statement';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async checkBalance(walletId) {
    try {
      const balance = await this.repository.checkBalance(walletId);
      return {
        success: true,
        data: balance
      };
    } catch (error) {
      console.error('Error in StudentWalletService.checkBalance:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to check wallet balance';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getAllActiveWallets() {
    try {
      const summary = await this.repository.getAllActive();
      return {
        success: true,
        data: summary
      };
    } catch (error) {
      console.error('Error in StudentWalletService.getAllActiveWallets:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to fetch active wallets';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async processBulkTopup(wallets) {
    try {
      if (!wallets || !Array.isArray(wallets) || wallets.length === 0) {
        return {
          success: false,
          error: 'Invalid bulk topup data'
        };
      }

      const result = await this.repository.bulkTopup(wallets);
      return {
        success: true,
        data: result,
        message: `Bulk topup completed. ${result.summary.successful} successful, ${result.summary.failed} failed.`
      };
    } catch (error) {
      console.error('Error in StudentWalletService.processBulkTopup:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to process bulk topup';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getAllWallets(filters = {}) {
    try {
      const wallets = await this.repository.findAll(filters);
      return {
        success: true,
        data: wallets
      };
    } catch (error) {
      console.error('Error in StudentWalletService.getAllWallets:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to fetch wallets';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getWalletById(id) {
    try {
      const wallet = await this.repository.findById(id);
      return {
        success: true,
        data: wallet
      };
    } catch (error) {
      console.error('Error in StudentWalletService.getWalletById:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to fetch wallet';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async createWallet(walletData) {
    try {
      const wallet = await this.repository.create(walletData);
      return {
        success: true,
        data: wallet,
        message: 'Wallet created successfully'
      };
    } catch (error) {
      console.error('Error in StudentWalletService.createWallet:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to create wallet';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async updateWallet(id, walletData) {
    try {
      const wallet = await this.repository.update(id, walletData);
      return {
        success: true,
        data: wallet,
        message: 'Wallet updated successfully'
      };
    } catch (error) {
      console.error('Error in StudentWalletService.updateWallet:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to update wallet';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Validation helpers
  validateTopupData(topupData) {
    if (!topupData.amount || topupData.amount <= 0) {
      return { valid: false, error: 'Topup amount must be greater than 0' };
    }

    if (!topupData.paymentMethod) {
      return { valid: false, error: 'Payment method is required' };
    }

    const maxTopup = 50000; // Maximum topup limit
    if (topupData.amount > maxTopup) {
      return { valid: false, error: `Topup amount cannot exceed ₹${maxTopup}` };
    }

    return { valid: true };
  }

  validatePurchaseData(purchaseData) {
    if (!purchaseData.amount || purchaseData.amount <= 0) {
      return { valid: false, error: 'Purchase amount must be greater than 0' };
    }

    if (!purchaseData.category) {
      return { valid: false, error: 'Purchase category is required' };
    }

    if (!purchaseData.description) {
      return { valid: false, error: 'Purchase description is required' };
    }

    return { valid: true };
  }

  // Helper method to get low balance wallets
  async getLowBalanceWallets(threshold = 100) {
    try {
      const wallets = await this.repository.findAll();
      const lowBalanceWallets = wallets.filter(wallet =>
        wallet.currentBalance < threshold && wallet.status === 'active'
      );

      return {
        success: true,
        data: lowBalanceWallets,
        meta: {
          total: lowBalanceWallets.length,
          threshold
        }
      };
    } catch (error) {
      console.error('Error in StudentWalletService.getLowBalanceWallets:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to fetch low balance wallets';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Calculate wallet statistics
  async getWalletStatistics() {
    try {
      const summary = await this.repository.getAllActive();

      const stats = {
        totalWallets: summary?.totalWallets || 0,
        activeWallets: summary?.wallets?.filter(w => w.status === 'active').length || 0,
        totalBalance: summary?.totalBalance || 0,
        averageBalance: summary?.totalWallets > 0
          ? summary.totalBalance / summary.totalWallets
          : 0,
        lowBalanceCount: summary?.wallets?.filter(w => w.isLowBalance).length || 0
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error in StudentWalletService.getWalletStatistics:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to calculate wallet statistics';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}