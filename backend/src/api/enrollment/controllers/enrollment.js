module.exports = {
  async findEnrollments(ctx) {
    try {
      const enrollments = await strapi.entityService.findMany('api::enrollment.enrollment', {
        populate: {
          student: true,
          academic_year: true,
          division: true,
          administration: {
            populate: {
              division: true,
            },
          },
        },
      });
      ctx.body = enrollments;
    } catch (err) {
      ctx.body = err;
      ctx.status = 500;
    }
  },

  async updateStatus(ctx) {
    const { id } = ctx.params;
    const { status } = ctx.request.body;

    if (!status) {
      return ctx.badRequest('Status is required');
    }

    const validStatuses = ['Enquiry', 'Waiting', 'Enrolled', 'Dropped'];
    if (!validStatuses.includes(status)) {
      return ctx.badRequest('Invalid status provided');
    }

    try {
      const updatedEnrollment = await strapi.entityService.update(
        'api::enrollment.enrollment',
        id,
        { data: { status } }
      );
      return { data: updatedEnrollment };
    } catch (err) {
      ctx.body = err;
      ctx.status = 500;
    }
  },
};
