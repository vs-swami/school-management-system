'use strict';

/**
 * class controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::class.class', ({ strapi }) => ({
  async find(ctx) {
    // Ensure a default sort if none is provided
    if (!ctx.query.sort) {
      ctx.query.sort = 'classname:asc'; // Default sort by classname ascending
    }

    // Populate related data by default
    if (!ctx.query.populate) {
      ctx.query.populate = {
        enrollments: {
          populate: {
            student: true,
            administration: {
              populate: {
                division: true
              }
            }
          }
        },
        class_thresholds: true,
        fee_assignments: true
      };
    }

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  // Custom method to get class with full statistics
  async findWithStats(ctx) {
    const { id } = ctx.params;

    try {
      // Get the class with all relations
      const classEntity = await strapi.entityService.findOne('api::class.class', id, {
        populate: {
          enrollments: {
            populate: {
              student: true,
              academic_year: true,
              administration: {
                populate: {
                  division: true
                }
              }
            }
          },
          class_thresholds: true,
          fee_assignments: true
        }
      });

      if (!classEntity) {
        return ctx.notFound('Class not found');
      }

      // Calculate statistics
      const stats = {
        totalEnrollments: classEntity.enrollments?.length || 0,
        activeEnrollments: classEntity.enrollments?.filter(e => e.enrollment_status === 'Enrolled').length || 0,
        pendingEnrollments: classEntity.enrollments?.filter(e => ['Enquiry', 'Waiting', 'Processing'].includes(e.enrollment_status)).length || 0,
        divisionBreakdown: {},
        feeCollection: {}
      };

      // Calculate division breakdown
      classEntity.enrollments?.forEach(enrollment => {
        if (enrollment.administration?.division) {
          const divName = enrollment.administration.division.name;
          if (!stats.divisionBreakdown[divName]) {
            stats.divisionBreakdown[divName] = 0;
          }
          stats.divisionBreakdown[divName]++;
        }
      });

      const sanitized = await this.sanitizeOutput({ ...classEntity, stats }, ctx);
      return this.transformResponse(sanitized);
    } catch (error) {
      strapi.log.error(`Error fetching class with stats: ${error.message}`);
      return ctx.badRequest('Failed to fetch class statistics');
    }
  },

  // Get all classes with summary statistics
  async findAllWithSummary(ctx) {
    try {
      const classes = await strapi.entityService.findMany('api::class.class', {
        populate: {
          enrollments: {
            populate: {
              administration: {
                populate: {
                  division: true
                }
              }
            }
          }
        }
      });

      const classesWithSummary = classes.map(cls => ({
        id: cls.id,
        classname: cls.classname,
        summary: {
          totalStudents: cls.enrollments?.filter(e => e.enrollment_status === 'Enrolled').length || 0,
          totalEnrollments: cls.enrollments?.length || 0,
          divisions: [...new Set(cls.enrollments?.map(e => e.administration?.division?.name).filter(Boolean))].length,
          potentialRevenue: 0
        }
      }));

      return this.transformResponse(classesWithSummary);
    } catch (error) {
      strapi.log.error(`Error fetching classes with summary: ${error.message}`);
      return ctx.badRequest('Failed to fetch classes summary');
    }
  },

  /**
   * Get comprehensive metrics for classes
   */
  async getMetrics(ctx) {
    try {
      const { classId } = ctx.params;
      const classMetricsService = require("../services/class-metrics");

      const metrics = await classMetricsService.getClassMetrics(classId || null);

      return ctx.send({
        data: metrics,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error fetching class metrics:", error);
      return ctx.badRequest("Failed to fetch class metrics", {
        error: error.message,
      });
    }
  },

  /**
   * Get summary statistics across all classes
   */
  async getSummaryStats(ctx) {
    try {
      const classMetricsService = require("../services/class-metrics");

      const summary = await classMetricsService.getSummaryStatistics();

      return ctx.send({
        data: summary,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error fetching summary statistics:", error);
      return ctx.badRequest("Failed to fetch summary statistics", {
        error: error.message,
      });
    }
  }
}));
