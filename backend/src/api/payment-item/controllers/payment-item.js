'use strict';

/**
 * payment-item controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::payment-item.payment-item', ({ strapi }) => ({
  async find(ctx) {
    const { query } = ctx;

    // Add default population
    if (!query.populate) {
      query.populate = {
        payment_schedule: {
          populate: {
            enrollment: {
              populate: {
                student: true,
                academic_year: true
              }
            }
          }
        },
        fee_definition: true,
        transactions: true
      };
    }

    const entities = await strapi.service('api::payment-item.payment-item').find(query);
    const sanitizedEntities = await this.sanitizeOutput(entities, ctx);

    return this.transformResponse(sanitizedEntities);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    // Add default population
    if (!query.populate) {
      query.populate = {
        payment_schedule: {
          populate: {
            enrollment: {
              populate: {
                student: true,
                academic_year: true
              }
            }
          }
        },
        fee_definition: true,
        transactions: true
      };
    }

    const entity = await strapi.service('api::payment-item.payment-item').findOne(id, query);
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  async getBySchedule(ctx) {
    const { scheduleId } = ctx.params;
    const { query = {} } = ctx;

    try {
      const paymentItems = await strapi.db.query('api::payment-item.payment-item').findMany({
        where: {
          payment_schedule: scheduleId
        },
        populate: {
          fee_definition: true,
          transactions: true,
          payment_schedule: {
            populate: {
              enrollment: {
                populate: {
                  student: true
                }
              }
            }
          }
        },
        orderBy: { due_date: 'asc' }
      });

      return this.transformResponse(paymentItems);
    } catch (error) {
      ctx.throw(500, `Error fetching payment items: ${error.message}`);
    }
  },

  async updatePaymentStatus(ctx) {
    const { id } = ctx.params;
    const { status, paid_amount } = ctx.request.body;

    try {
      const updatedItem = await strapi.service('api::payment-item.payment-item').update(id, {
        data: {
          status,
          paid_amount
        }
      });

      return this.transformResponse(updatedItem);
    } catch (error) {
      ctx.throw(500, `Error updating payment status: ${error.message}`);
    }
  }
}));