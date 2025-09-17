module.exports = {
  async findEnrollments(ctx) {
    try {
      const enrollments = await strapi.entityService.findMany('api::enrollment.enrollment', {
        populate: [
          'student',
          'academic_year',
          'division',
          'administration.division',
          'class',
          'admission_type',
        ],
      });
      ctx.body = enrollments;
    } catch (err) {
      ctx.body = err;
      ctx.status = 500;
    }
  },

  async updateStatus(ctx) {
    const { id } = ctx.params;
    // Ensure you fetch the full enrollment object to bypass validation if necessary
    const { enrollment_status } = ctx.request.body;

    if (!enrollment_status) {
      return ctx.badRequest('Enrollment status is required.');
    }

    const validStatuses = ['Enquiry', 'Waiting', 'Enrolled', 'Rejected', 'Processing']; // Include 'Processing'
    if (!validStatuses.includes(enrollment_status)) {
      return ctx.badRequest('Invalid enrollment status provided.');
    }

    try {
      const updatedEnrollment = await strapi.entityService.update(
        'api::enrollment.enrollment',
        id,
        { data: { enrollment_status } }
      );
      return this.transformResponse(updatedEnrollment);
    } catch (error) {
      strapi.log.error(`Error updating enrollment status: ${error.message}`);
      ctx.status = 500;
    }
  },
};
