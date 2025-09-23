'use strict';

/**
 * transaction controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::transaction.transaction', ({ strapi }) => ({

  async processFeePayment(ctx) {
    const paymentData = ctx.request.body;

    try {
      // Validate required fields
      if (!paymentData.scheduleId || !paymentData.paymentItemIds || !paymentData.amount) {
        return ctx.badRequest('Missing required payment information');
      }

      const transaction = await strapi.service('api::transaction.transaction').processFeePayment(paymentData);

      return ctx.send({
        data: transaction,
        message: 'Payment processed successfully'
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async getDailyCollection(ctx) {
    const { date } = ctx.query;

    try {
      const collectionDate = date ? new Date(date) : new Date();
      const collection = await strapi.service('api::transaction.transaction').getDailyCollection(collectionDate);

      return ctx.send({
        data: collection
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async getStudentTransactions(ctx) {
    const { studentId } = ctx.params;

    try {
      const transactions = await strapi.service('api::transaction.transaction').getStudentTransactions(studentId);

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

  async getReceipt(ctx) {
    const { transactionId } = ctx.params;

    try {
      const transaction = await strapi.entityService.findOne('api::transaction.transaction', transactionId, {
        populate: {
          payment_items: {
            populate: {
              fee_definition: true,
              payment_schedule: {
                populate: {
                  enrollment: {
                    populate: ['student', 'class', 'academic_year']
                  }
                }
              }
            }
          }
        }
      });

      if (!transaction) {
        return ctx.notFound('Transaction not found');
      }

      // Format receipt data
      const receipt = {
        receiptNumber: transaction.receipt_number,
        transactionNumber: transaction.transaction_number,
        date: transaction.transaction_date,
        student: transaction.payment_items[0]?.payment_schedule?.enrollment?.student,
        class: transaction.payment_items[0]?.payment_schedule?.enrollment?.class,
        academicYear: transaction.payment_items[0]?.payment_schedule?.enrollment?.academic_year,
        paymentMethod: transaction.payment_method,
        amount: transaction.amount,
        payerName: transaction.payer_name,
        payerContact: transaction.payer_contact,
        items: transaction.payment_items.map(item => ({
          description: item.description,
          amount: item.amount,
          feeType: item.fee_definition?.name
        }))
      };

      return ctx.send({
        data: receipt
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  }
}));