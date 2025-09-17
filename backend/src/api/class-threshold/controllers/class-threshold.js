'use strict';

/**
 * class-threshold controller - Simple & Compatible Version
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::class-threshold.class-threshold', ({ strapi }) => ({
  
  // Override find method to handle sorting issues only
  async find(ctx) {
    // Fix sorting issues by removing problematic sort params
    const sanitizedQuery = { ...ctx.query };
    
    // Remove problematic sort parameters that cause ASC errors
    if (sanitizedQuery.sort && typeof sanitizedQuery.sort === 'string') {
      if (sanitizedQuery.sort.includes('class:') || sanitizedQuery.sort.includes('division:')) {
        delete sanitizedQuery.sort; // Remove problematic sorts
      }
    }

    // Use the parent find method with sanitized query
    ctx.query = sanitizedQuery;
    
    try {
      return await super.find(ctx);
    } catch (error) {
      console.error('Find error:', error.message);
      // Fallback: try without any sorting
      ctx.query = { ...sanitizedQuery, sort: undefined };
      return await super.find(ctx);
    }
  },

  // Keep other methods simple - just add populate
  async findOne(ctx) {
    ctx.query.populate = ctx.query.populate || ['class', 'division'];
    return await super.findOne(ctx);
  },

  async create(ctx) {
    ctx.query.populate = ['class', 'division'];
    return await super.create(ctx);
  },

  async update(ctx) {
    ctx.query.populate = ['class', 'division'];
    return await super.update(ctx);
  },

  // Add custom methods only
  async findByClass(ctx) {
    const { classId } = ctx.params;
    
    try {
      const entity = await strapi.entityService.findMany('api::class-threshold.class-threshold', {
        filters: { class: classId },
        populate: ['class', 'division']
      });

      const sanitized = await this.sanitizeOutput(entity, ctx);
      return this.transformResponse(sanitized);
    } catch (error) {
      return ctx.badRequest('Error fetching thresholds for class');
    }
  },

  async getCapacitySummary(ctx) {
    try {
      const entity = await strapi.entityService.findMany('api::class-threshold.class-threshold', {
        populate: ['class', 'division']
      });

      // Simple grouping by class
      const summary = {};
      entity.forEach(threshold => {
        const classId = threshold.class.id;
        if (!summary[classId]) {
          summary[classId] = {
            class: threshold.class,
            divisions: [],
            totalCapacity: 0
          };
        }
        summary[classId].divisions.push({
          division: threshold.division,
          capacity: threshold.threshold_number
        });
        summary[classId].totalCapacity += threshold.threshold_number;
      });

      return Object.values(summary);
    } catch (error) {
      return ctx.internalServerError('Error generating summary');
    }
  },

  async bulkCreate(ctx) {
    const { classId, divisions } = ctx.request.body;
    
    if (!classId || !Array.isArray(divisions)) {
      return ctx.badRequest('classId and divisions array required');
    }

    try {
      const results = [];
      
      for (const div of divisions) {
        const created = await strapi.entityService.create('api::class-threshold.class-threshold', {
          data: {
            class: classId,
            division: div.division,
            threshold_number: div.threshold_number
          },
          populate: ['class', 'division']
        });
        results.push(created);
      }

      const sanitized = await this.sanitizeOutput(results, ctx);
      return this.transformResponse(sanitized);
    } catch (error) {
      console.error('Bulk create error:', error);
      return ctx.internalServerError('Error creating thresholds');
    }
  },

async getAvailableCapacity(ctx) {
  const { classId, divisionId } = ctx.params;
  const capacity = await strapi.service('api::class-threshold.class-threshold')
    .getAvailableCapacity(classId, divisionId);
  return capacity;
},

async getClassUtilization(ctx) {
  const { classId } = ctx.params;
  const utilization = await strapi.service('api::class-threshold.class-threshold')
    .getClassUtilization(classId);
  return utilization;
},

async findBestDivision(ctx) {
  const { classId } = ctx.params;
  
  try {
    const bestDivision = await strapi.service('api::class-threshold.class-threshold')
      .findBestAvailableDivision(classId);
    
    if (!bestDivision) {
      return ctx.notFound('No available divisions found for this class');
    }
    
    return bestDivision;
  } catch (error) {
    console.error('Error finding best division:', error);
    return ctx.internalServerError('Error finding best available division');
  }
},

}));