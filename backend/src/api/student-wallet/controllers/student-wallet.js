'use strict';

/**
 * student-wallet controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::student-wallet.student-wallet', ({ strapi }) => ({

  async findByStudent(ctx) {
    const { studentId } = ctx.params;

    try {
      const wallet = await strapi.service('api::student-wallet.student-wallet').getWalletByStudent(studentId);

      return ctx.send({
        data: wallet
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async topup(ctx) {
    const { walletId } = ctx.params;
    const topupData = ctx.request.body;

    try {
      // Validate required fields
      if (!topupData.amount || topupData.amount <= 0) {
        return ctx.badRequest('Invalid topup amount');
      }

      if (!topupData.paymentMethod) {
        return ctx.badRequest('Payment method is required');
      }

      const result = await strapi.service('api::student-wallet.student-wallet').processTopup(walletId, topupData);

      return ctx.send({
        data: result,
        message: 'Wallet topped up successfully'
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async purchase(ctx) {
    const { walletId } = ctx.params;
    const purchaseData = ctx.request.body;

    try {
      // Validate required fields
      if (!purchaseData.amount || purchaseData.amount <= 0) {
        return ctx.badRequest('Invalid purchase amount');
      }

      if (!purchaseData.category || !purchaseData.description) {
        return ctx.badRequest('Category and description are required');
      }

      const result = await strapi.service('api::student-wallet.student-wallet').processPurchase(walletId, purchaseData);

      return ctx.send({
        data: result,
        message: 'Purchase completed successfully'
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async getTransactions(ctx) {
    const { walletId } = ctx.params;
    const { startDate, endDate, category, limit } = ctx.query;

    try {
      const filters = {};

      if (startDate && endDate) {
        filters.transaction_date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      if (category) {
        filters.category = category;
      }

      if (limit) {
        filters.limit = parseInt(limit);
      }

      const transactions = await strapi.service('api::student-wallet.student-wallet').getWalletTransactions(walletId, filters);

      return ctx.send({
        data: transactions,
        meta: {
          total: transactions.length
        }
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async getStatement(ctx) {
    const { walletId } = ctx.params;
    const { startDate, endDate } = ctx.query;

    try {
      if (!startDate || !endDate) {
        return ctx.badRequest('Start date and end date are required');
      }

      const statement = await strapi.service('api::student-wallet.student-wallet').getWalletStatement(
        walletId,
        new Date(startDate),
        new Date(endDate)
      );

      return ctx.send({
        data: statement
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async getAllActive(ctx) {
    try {
      const summary = await strapi.service('api::student-wallet.student-wallet').getAllActiveWallets();

      return ctx.send({
        data: summary
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async checkBalance(ctx) {
    const { walletId } = ctx.params;

    try {
      const wallet = await strapi.entityService.findOne('api::student-wallet.student-wallet', walletId, {
        populate: ['student']
      });

      if (!wallet) {
        return ctx.notFound('Wallet not found');
      }

      return ctx.send({
        data: {
          walletId: wallet.wallet_id,
          student: wallet.student,
          currentBalance: wallet.current_balance,
          status: wallet.status,
          lowBalanceThreshold: wallet.low_balance_threshold,
          isLowBalance: parseFloat(wallet.current_balance) < parseFloat(wallet.low_balance_threshold),
          lastActivity: wallet.last_activity
        }
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async bulkTopup(ctx) {
    const { wallets } = ctx.request.body;

    if (!wallets || !Array.isArray(wallets)) {
      return ctx.badRequest('Invalid bulk topup data');
    }

    const results = [];
    const errors = [];

    for (const walletTopup of wallets) {
      try {
        const result = await strapi.service('api::student-wallet.student-wallet').processTopup(
          walletTopup.walletId,
          walletTopup
        );
        results.push({
          walletId: walletTopup.walletId,
          success: true,
          result
        });
      } catch (error) {
        errors.push({
          walletId: walletTopup.walletId,
          success: false,
          error: error.message
        });
      }
    }

    return ctx.send({
      data: {
        successful: results,
        failed: errors,
        summary: {
          total: wallets.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });
  }
}));