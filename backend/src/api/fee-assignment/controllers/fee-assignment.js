"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::fee-assignment.fee-assignment", ({ strapi }) => ({
  async delete(ctx) {
    const { id } = ctx.params;

    try {
      // Log the deletion attempt
      console.log(`Attempting to delete fee-assignment with ID: ${id}`);

      // First check if the record exists
      const existing = await strapi.entityService.findOne('api::fee-assignment.fee-assignment', id);
      console.log('Existing record:', existing);

      if (!existing) {
        return ctx.notFound('Fee assignment not found');
      }

      // Perform the deletion
      const result = await strapi.entityService.delete('api::fee-assignment.fee-assignment', id);
      console.log('Deletion result:', result);

      // Verify deletion
      const checkDeleted = await strapi.entityService.findOne('api::fee-assignment.fee-assignment', id);
      console.log('Record after deletion attempt:', checkDeleted);

      if (checkDeleted) {
        console.error('Record still exists after deletion!');
        ctx.throw(500, 'Failed to delete fee assignment');
      }

      return ctx.send(null, 204);
    } catch (error) {
      console.error('Error deleting fee-assignment:', error);
      throw error;
    }
  }
}));

