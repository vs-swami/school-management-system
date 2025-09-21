const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
  // Override find to populate administration relation
  async find(ctx) {
    const { query } = ctx;

    // Ensure administration relation is populated
    const entities = await strapi.entityService.findMany('api::enrollment.enrollment', {
      ...query,
      populate: {
        student: true,
        academic_year: true,
        class: true,
        administration: {
          populate: {
            division: true,
            seat_allocations: true
          }
        }
      }
    });

    const sanitizedEntities = await this.sanitizeOutput(entities, ctx);
    return this.transformResponse(sanitizedEntities);
  },

  // Override findOne to populate administration relation
  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const entity = await strapi.entityService.findOne('api::enrollment.enrollment', id, {
      ...query,
      populate: {
        student: true,
        academic_year: true,
        class: true,
        administration: {
          populate: {
            division: true,
            seat_allocations: true
          }
        }
      }
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  async updateStatus(ctx) {
    const { id } = ctx.params;
    const { enrollment_status } = ctx.request.body.data || ctx.request.body;

    if (!enrollment_status) {
      return ctx.badRequest('Enrollment status is required.');
    }

    const validStatuses = ['Enquiry', 'Waiting', 'Enrolled', 'Rejected', 'Processing'];
    if (!validStatuses.includes(enrollment_status)) {
      return ctx.badRequest('Invalid enrollment status provided.');
    }

    try {
      const updatedEnrollment = await strapi.entityService.update(
        'api::enrollment.enrollment',
        id,
        {
          data: { enrollment_status },
          populate: {
            student: true,
            academic_year: true,
            class: true,
            administration: {
              populate: {
                division: true,
                seat_allocations: true
              }
            }
          }
        }
      );

      const sanitized = await this.sanitizeOutput(updatedEnrollment, ctx);
      return this.transformResponse(sanitized);
    } catch (error) {
      strapi.log.error(`Error updating enrollment status: ${error.message}`);
      return ctx.badRequest('Failed to update enrollment status');
    }
  },
}));
