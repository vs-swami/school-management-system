'use strict';

/**
 * transaction service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::transaction.transaction', ({ strapi }) => ({

  async processFeePayment(paymentData) {
    const {
      scheduleId,
      paymentItemIds,
      amount,
      paymentMethod,
      referenceNumber,
      payerName,
      payerContact,
      notes
    } = paymentData;

    // Validate payment items
    const paymentItems = await strapi.entityService.findMany('api::payment-item.payment-item', {
      filters: {
        id: { $in: paymentItemIds },
        payment_schedule: scheduleId
      },
      populate: ['payment_schedule', 'fee_definition']
    });

    if (paymentItems.length !== paymentItemIds.length) {
      throw new Error('Invalid payment items selected');
    }

    // Calculate total due for selected items
    const totalDue = paymentItems.reduce((sum, item) => {
      return sum + (parseFloat(item.net_amount) - parseFloat(item.paid_amount || 0));
    }, 0);

    if (amount > totalDue) {
      throw new Error(`Payment amount (${amount}) exceeds total due (${totalDue})`);
    }

    // Generate transaction number
    const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create transaction
    const transaction = await strapi.entityService.create('api::transaction.transaction', {
      data: {
        transaction_number: transactionNumber,
        transaction_type: 'income',
        transaction_category: 'student_fee',
        amount: amount,
        currency: 'INR',
        payment_method: paymentMethod,
        transaction_date: new Date(),
        reference_number: referenceNumber,
        status: 'completed',
        payment_items: paymentItemIds,
        payer_name: payerName,
        payer_contact: payerContact,
        receipt_number: this.generateReceiptNumber(),
        notes: notes
      }
    });

    // Update payment items
    let remainingAmount = amount;
    for (const item of paymentItems) {
      const itemDue = parseFloat(item.net_amount) - parseFloat(item.paid_amount || 0);

      if (remainingAmount >= itemDue) {
        // Fully pay this item
        await strapi.entityService.update('api::payment-item.payment-item', item.id, {
          data: {
            paid_amount: parseFloat(item.net_amount),
            status: 'paid'
          }
        });
        remainingAmount -= itemDue;
      } else if (remainingAmount > 0) {
        // Partially pay this item
        await strapi.entityService.update('api::payment-item.payment-item', item.id, {
          data: {
            paid_amount: parseFloat(item.paid_amount || 0) + remainingAmount,
            status: 'partially_paid'
          }
        });
        remainingAmount = 0;
      }
    }

    // Update payment schedule
    const schedule = await strapi.entityService.findOne('api::payment-schedule.payment-schedule', scheduleId, {
      populate: ['payment_items']
    });

    const totalPaid = schedule.payment_items.reduce((sum, item) => {
      return sum + parseFloat(item.paid_amount || 0);
    }, 0);

    await strapi.entityService.update('api::payment-schedule.payment-schedule', scheduleId, {
      data: {
        paid_amount: totalPaid,
        status: totalPaid >= schedule.total_amount ? 'completed' : 'active'
      }
    });

    return transaction;
  },

  generateReceiptNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    return `RCP-${year}${month}${day}-${random}`;
  },

  async getDailyCollection(date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const transactions = await strapi.entityService.findMany('api::transaction.transaction', {
      filters: {
        transaction_type: 'income',
        transaction_category: { $in: ['student_fee', 'transport_fee', 'lab_fee', 'exam_fee'] },
        transaction_date: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: 'completed'
      },
      populate: ['payment_items.payment_schedule.enrollment.student', 'payment_items.payment_schedule.enrollment.class']
    });

    const summary = {
      date: date.toISOString().split('T')[0],
      totalCollection: transactions.reduce((sum, txn) => sum + parseFloat(txn.amount), 0),
      transactionCount: transactions.length,
      byPaymentMethod: {},
      byCategory: {},
      transactions: transactions
    };

    // Group by payment method
    transactions.forEach(txn => {
      if (!summary.byPaymentMethod[txn.payment_method]) {
        summary.byPaymentMethod[txn.payment_method] = 0;
      }
      summary.byPaymentMethod[txn.payment_method] += parseFloat(txn.amount);

      if (!summary.byCategory[txn.transaction_category]) {
        summary.byCategory[txn.transaction_category] = 0;
      }
      summary.byCategory[txn.transaction_category] += parseFloat(txn.amount);
    });

    return summary;
  },

  async getStudentTransactions(studentId) {
    // Get all payment schedules for the student
    const schedules = await strapi.entityService.findMany('api::payment-schedule.payment-schedule', {
      filters: {
        enrollment: {
          student: studentId
        }
      },
      populate: ['payment_items']
    });

    const paymentItemIds = schedules.flatMap(schedule =>
      schedule.payment_items.map(item => item.id)
    );

    // Get all transactions for these payment items
    const transactions = await strapi.entityService.findMany('api::transaction.transaction', {
      filters: {
        payment_items: {
          id: { $in: paymentItemIds }
        }
      },
      populate: ['payment_items.fee_definition'],
      sort: { transaction_date: 'desc' }
    });

    return transactions;
  }
}));