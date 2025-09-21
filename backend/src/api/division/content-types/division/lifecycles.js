'use strict';

const { ApplicationError } = require('@strapi/utils').errors;

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    if (data.name) {
      // Check if this division name already exists
      const existingDivisions = await strapi.entityService.findMany('api::division.division', {
        filters: {
          name: data.name
        },
        populate: ['class'],
        limit: 1
      });

      if (existingDivisions && existingDivisions.length > 0) {
        const existingDivision = existingDivisions[0];
        const className = existingDivision.class?.name || 'another class';
        throw new ApplicationError(
          `Division "${data.name}" already exists in ${className}. Each division name must be unique across the entire school.`,
          400
        );
      }
    }
  },

  async beforeUpdate(event) {
    const { data, where } = event.params;

    if (data.name) {
      // Check if this division name already exists (excluding current division)
      const existingDivisions = await strapi.entityService.findMany('api::division.division', {
        filters: {
          name: data.name,
          id: {
            $ne: where.id
          }
        },
        populate: ['class'],
        limit: 1
      });

      if (existingDivisions && existingDivisions.length > 0) {
        const existingDivision = existingDivisions[0];
        const className = existingDivision.class?.name || 'another class';
        throw new ApplicationError(
          `Division "${data.name}" already exists in ${className}. Each division name must be unique across the entire school.`,
          400
        );
      }
    }
  }
};