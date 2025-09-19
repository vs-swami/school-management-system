"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::fee-definition.fee-definition", ({ strapi }) => ({
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;

    try {
      // Log the incoming request for debugging
      strapi.log.info(`Updating fee-definition ${id} with data:`, JSON.stringify(data));

      // Update the fee definition with the provided data
      const entity = await strapi.entityService.update(
        'api::fee-definition.fee-definition',
        id,
        {
          data: data,
          populate: ['type', 'installments']
        }
      );

      const sanitized = await this.sanitizeOutput(entity, ctx);
      return this.transformResponse(sanitized);
    } catch (error) {
      strapi.log.error(`Error updating fee-definition ${id}:`, error);
      return ctx.badRequest(`Failed to update fee definition: ${error.message}`);
    }
  },

  async find(ctx) {
    // Ensure populate is set for relations
    if (!ctx.query.populate) {
      ctx.query.populate = ['type', 'installments'];
    }
    return super.find(ctx);
  },

  async findOne(ctx) {
    // Ensure populate is set for relations
    if (!ctx.query.populate) {
      ctx.query.populate = ['type', 'installments'];
    }
    return super.findOne(ctx);
  }
}));

