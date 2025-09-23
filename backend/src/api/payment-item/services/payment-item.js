'use strict';

/**
 * payment-item service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::payment-item.payment-item', ({ strapi }) => ({
  async findBySchedule(scheduleId, params = {}) {
    return await strapi.db.query('api::payment-item.payment-item').findMany({
      where: {
        payment_schedule: scheduleId,
        ...params.where
      },
      populate: params.populate || {
        fee_definition: true,
        transactions: true
      },
      orderBy: params.orderBy || { due_date: 'asc' }
    });
  },

  async getPendingItems(filters = {}) {
    return await strapi.db.query('api::payment-item.payment-item').findMany({
      where: {
        status: {
          $in: ['pending', 'partially_paid', 'overdue']
        },
        ...filters
      },
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
      },
      orderBy: { due_date: 'asc' }
    });
  },

  async updatePaymentStatus(itemId, paidAmount, transactionId) {
    const item = await strapi.db.query('api::payment-item.payment-item').findOne({
      where: { id: itemId },
      populate: ['transactions']
    });

    if (!item) {
      throw new Error('Payment item not found');
    }

    const totalPaid = parseFloat(item.paid_amount || 0) + parseFloat(paidAmount);
    const netAmount = parseFloat(item.net_amount);

    let newStatus = 'pending';
    if (totalPaid >= netAmount) {
      newStatus = 'paid';
    } else if (totalPaid > 0) {
      newStatus = 'partially_paid';
    }

    // Update payment item
    const updatedItem = await strapi.db.query('api::payment-item.payment-item').update({
      where: { id: itemId },
      data: {
        paid_amount: totalPaid,
        status: newStatus,
        transactions: {
          connect: [{ id: transactionId }]
        }
      },
      populate: {
        fee_definition: true,
        transactions: true,
        payment_schedule: true
      }
    });

    return updatedItem;
  },

  async getOverdueItems(date = new Date()) {
    return await strapi.db.query('api::payment-item.payment-item').findMany({
      where: {
        status: {
          $ne: 'paid'
        },
        due_date: {
          $lt: date
        }
      },
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
    });
  }
}));