const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::enrollment.enrollment', ({ strapi }) => ({
  // The default CRUD operations are automatically inherited
  // We only need to add our custom method for updating status

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
          populate: ['student', 'academic_year', 'administration.division', 'class']
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
