'use strict';

/**
 * student-wallet service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::student-wallet.student-wallet', ({ strapi }) => ({

  async createWalletForStudent(studentId) {
    // Check if wallet already exists
    const existingWallet = await strapi.entityService.findMany('api::student-wallet.student-wallet', {
      filters: { student: studentId },
      limit: 1
    });

    if (existingWallet && existingWallet.length > 0) {
      return existingWallet[0];
    }

    // Generate wallet ID
    const walletId = `WLT-${studentId}-${Date.now()}`;

    // Create new wallet
    const wallet = await strapi.entityService.create('api::student-wallet.student-wallet', {
      data: {
        student: studentId,
        wallet_id: walletId,
        current_balance: 0,
        total_deposits: 0,
        total_withdrawals: 0,
        status: 'active',
        low_balance_threshold: 100,
        created_at: new Date()
      }
    });

    return wallet;
  },

  async getWalletByStudent(studentId) {
    const wallet = await strapi.entityService.findMany('api::student-wallet.student-wallet', {
      filters: { student: studentId },
      populate: ['student'],
      limit: 1
    });

    if (!wallet || wallet.length === 0) {
      // Create wallet if it doesn't exist
      return await this.createWalletForStudent(studentId);
    }

    return wallet[0];
  },

  async processTopup(walletId, topupData) {
    const {
      amount,
      paymentMethod,
      referenceNumber,
      payerName,
      payerContact,
      notes
    } = topupData;

    // Get wallet
    const wallet = await strapi.entityService.findOne('api::student-wallet.student-wallet', walletId);

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.status !== 'active') {
      throw new Error('Wallet is not active');
    }

    // Create transaction
    const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const transaction = await strapi.entityService.create('api::transaction.transaction', {
      data: {
        transaction_number: transactionNumber,
        transaction_type: 'income',
        transaction_category: 'wallet_topup',
        amount: amount,
        currency: 'INR',
        payment_method: paymentMethod,
        transaction_date: new Date(),
        reference_number: referenceNumber,
        status: 'completed',
        payer_name: payerName,
        payer_contact: payerContact,
        notes: notes
      }
    });

    // Create wallet transaction
    const walletTransaction = await strapi.entityService.create('api::wallet-transaction.wallet-transaction', {
      data: {
        wallet: walletId,
        transaction_type: 'deposit',
        amount: amount,
        balance_before: wallet.current_balance,
        balance_after: parseFloat(wallet.current_balance) + parseFloat(amount),
        description: `Wallet top-up via ${paymentMethod}`,
        category: 'topup',
        transaction: transaction.id,
        transaction_date: new Date()
      }
    });

    // Update wallet balance
    await strapi.entityService.update('api::student-wallet.student-wallet', walletId, {
      data: {
        current_balance: parseFloat(wallet.current_balance) + parseFloat(amount),
        total_deposits: parseFloat(wallet.total_deposits) + parseFloat(amount),
        last_activity: new Date()
      }
    });

    return {
      transaction,
      walletTransaction,
      newBalance: parseFloat(wallet.current_balance) + parseFloat(amount)
    };
  },

  async processPurchase(walletId, purchaseData) {
    const {
      amount,
      category,
      description,
      itemDetails,
      notes
    } = purchaseData;

    // Get wallet
    const wallet = await strapi.entityService.findOne('api::student-wallet.student-wallet', walletId);

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.status !== 'active') {
      throw new Error('Wallet is not active');
    }

    if (parseFloat(wallet.current_balance) < parseFloat(amount)) {
      throw new Error(`Insufficient balance. Current balance: ${wallet.current_balance}`);
    }

    // Check daily spending limit if set
    if (wallet.daily_spending_limit) {
      const todaySpending = await this.getTodaySpending(walletId);
      if (todaySpending + parseFloat(amount) > parseFloat(wallet.daily_spending_limit)) {
        throw new Error(`Daily spending limit exceeded. Limit: ${wallet.daily_spending_limit}`);
      }
    }

    // Create transaction
    const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const transaction = await strapi.entityService.create('api::transaction.transaction', {
      data: {
        transaction_number: transactionNumber,
        transaction_type: 'expense',
        transaction_category: category,
        amount: amount,
        currency: 'INR',
        payment_method: 'wallet',
        transaction_date: new Date(),
        status: 'completed',
        notes: notes
      }
    });

    // Create wallet transaction
    const walletTransaction = await strapi.entityService.create('api::wallet-transaction.wallet-transaction', {
      data: {
        wallet: walletId,
        transaction_type: 'purchase',
        amount: amount,
        balance_before: wallet.current_balance,
        balance_after: parseFloat(wallet.current_balance) - parseFloat(amount),
        description: description,
        category: category,
        item_details: itemDetails,
        transaction: transaction.id,
        transaction_date: new Date()
      }
    });

    // Update wallet balance
    const newBalance = parseFloat(wallet.current_balance) - parseFloat(amount);

    await strapi.entityService.update('api::student-wallet.student-wallet', walletId, {
      data: {
        current_balance: newBalance,
        total_withdrawals: parseFloat(wallet.total_withdrawals) + parseFloat(amount),
        last_activity: new Date()
      }
    });

    // Check for low balance alert
    if (newBalance < parseFloat(wallet.low_balance_threshold)) {
      // You can trigger notification here
      strapi.log.warn(`Low balance alert for wallet ${walletId}: ${newBalance}`);
    }

    return {
      transaction,
      walletTransaction,
      newBalance
    };
  },

  async getTodaySpending(walletId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const transactions = await strapi.entityService.findMany('api::wallet-transaction.wallet-transaction', {
      filters: {
        wallet: walletId,
        transaction_type: { $in: ['purchase', 'withdrawal'] },
        transaction_date: {
          $gte: today,
          $lt: tomorrow
        }
      }
    });

    return transactions.reduce((sum, txn) => sum + parseFloat(txn.amount), 0);
  },

  async getWalletTransactions(walletId, filters = {}) {
    const query = {
      filters: {
        wallet: walletId,
        ...filters
      },
      populate: ['transaction'],
      sort: { transaction_date: 'desc' },
      limit: filters.limit || 100
    };

    const transactions = await strapi.entityService.findMany('api::wallet-transaction.wallet-transaction', query);

    return transactions;
  },

  async getWalletStatement(walletId, startDate, endDate) {
    const wallet = await strapi.entityService.findOne('api::student-wallet.student-wallet', walletId, {
      populate: ['student']
    });

    const transactions = await strapi.entityService.findMany('api::wallet-transaction.wallet-transaction', {
      filters: {
        wallet: walletId,
        transaction_date: {
          $gte: startDate,
          $lte: endDate
        }
      },
      sort: { transaction_date: 'asc' }
    });

    const statement = {
      wallet: wallet,
      period: {
        from: startDate,
        to: endDate
      },
      openingBalance: 0, // Calculate based on transactions before startDate
      closingBalance: wallet.current_balance,
      transactions: transactions,
      summary: {
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalPurchases: 0,
        transactionCount: transactions.length
      }
    };

    // Calculate summary
    transactions.forEach(txn => {
      if (txn.transaction_type === 'deposit') {
        statement.summary.totalDeposits += parseFloat(txn.amount);
      } else if (txn.transaction_type === 'purchase') {
        statement.summary.totalPurchases += parseFloat(txn.amount);
      } else if (txn.transaction_type === 'withdrawal') {
        statement.summary.totalWithdrawals += parseFloat(txn.amount);
      }
    });

    // Calculate opening balance
    if (transactions.length > 0) {
      statement.openingBalance = parseFloat(transactions[0].balance_before);
    }

    return statement;
  },

  async getAllActiveWallets() {
    const wallets = await strapi.entityService.findMany('api::student-wallet.student-wallet', {
      filters: { status: 'active' },
      populate: ['student'],
      sort: { last_activity: 'desc' }
    });

    const summary = {
      totalWallets: wallets.length,
      totalBalance: wallets.reduce((sum, w) => sum + parseFloat(w.current_balance), 0),
      wallets: wallets
    };

    return summary;
  }
}));