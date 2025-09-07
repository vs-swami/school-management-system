'use strict';

module.exports = {
  async getMetrics(ctx) {
    try {
      // Get current academic year
      const currentYear = await strapi.entityService.findMany('api::academic-year.academic-year', {
        filters: { is_current: true },
        limit: 1
      });

      if (!currentYear.length) {
        return ctx.badRequest('No current academic year found');
      }

      const yearId = currentYear[0].id;

      // Parallel data fetching for better performance
      const [
        totalStudents,
        currentEnrollments,
        pendingDocuments,
        studentStats,
        enrollmentStats
      ] = await Promise.all([
        strapi.entityService.count('api::student.student'),
        strapi.entityService.count('api::enrollment.enrollment', {
          filters: { academic_year: yearId }
        }),
        strapi.entityService.count('api::student-document.student-document', {
          filters: { verified: false }
        }),
        strapi.service('api::student.student').getStatistics(),
        strapi.service('api::enrollment.enrollment').getEnrollmentStatistics(yearId)
      ]);

      // Recent activities (last 10)
      // TODO: Re-implement audit logging once the audit-log content type is available
      const recentActivities = []; // Temporarily empty array to prevent errors
      /*
      const recentActivities = await strapi.entityService.findMany('api::audit-log.audit-log', {
        sort: { createdAt: 'desc' },
        limit: 10,
        populate: { user: true }
      });
      */

      return {
        metrics: {
          totalStudents,
          currentEnrollments,
          pendingDocuments,
          activeTransport: Math.floor(Math.random() * 50) + 80 // Mock data for now
        },
        statistics: {
          students: studentStats,
          enrollments: enrollmentStats
        },
        recentActivities: recentActivities.map(activity => ({
          id: activity.id,
          action: activity.action,
          details: activity.details,
          user: activity.user?.username || 'System',
          createdAt: activity.createdAt
        })) // Use the empty array or actual data if re-enabled
      };
    } catch (error) {
      return ctx.badRequest('Error fetching dashboard metrics', { error: error.message });
    }
  }
};
