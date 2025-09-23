'use strict';

/**
 * payment-schedule controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::payment-schedule.payment-schedule', ({ strapi }) => ({

  async findByStudent(ctx) {
    const { studentId } = ctx.params;

    try {
      // First, check if the student has enrollments
      const enrollments = await strapi.entityService.findMany('api::enrollment.enrollment', {
        filters: { student: studentId },
        populate: {
          academic_year: true,
          administration: {
            populate: {
              division: {
                populate: {
                  class: true
                }
              }
            }
          }
        }
      });

      console.log(`Found ${enrollments.length} enrollments for student ${studentId}`);

      // Check for existing schedules
      let schedules = await strapi.service('api::payment-schedule.payment-schedule').getStudentSchedule(studentId);
      console.log(`Found ${schedules.length} existing schedules`);

      // If no schedules exist but enrollments do, generate schedules
      if (schedules.length === 0 && enrollments.length > 0) {
        console.log('No schedules found, generating for enrollments...');

        for (const enrollment of enrollments) {
          try {
            console.log(`Generating schedule for enrollment ${enrollment.id}`);
            await strapi.service('api::payment-schedule.payment-schedule').generateSchedule(enrollment.id);
          } catch (genError) {
            console.error(`Failed to generate schedule for enrollment ${enrollment.id}:`, genError.message);
          }
        }

        // Fetch schedules again after generation
        schedules = await strapi.service('api::payment-schedule.payment-schedule').getStudentSchedule(studentId);
        console.log(`After generation, found ${schedules.length} schedules`);
      }

      // Populate full details for the schedules
      const fullSchedules = await Promise.all(schedules.map(async (schedule) => {
        return await strapi.entityService.findOne('api::payment-schedule.payment-schedule', schedule.id, {
          populate: {
            payment_items: {
              populate: ['fee_definition']
            },
            enrollment: {
              populate: {
                student: true,
                academic_year: true,
                administration: {
                  populate: {
                    division: {
                      populate: {
                        class: true
                      }
                    }
                  }
                }
              }
            }
          }
        });
      }));

      return ctx.send({
        data: fullSchedules,
        meta: {
          total: fullSchedules.length,
          enrollmentsCount: enrollments.length,
          generatedNew: schedules.length > 0 && enrollments.length > 0
        }
      });
    } catch (error) {
      console.error('Error in findByStudent:', error);
      return ctx.badRequest(error.message);
    }
  },

  async getPending(ctx) {
    try {
      const pendingItems = await strapi.service('api::payment-schedule.payment-schedule').getPendingPayments();

      return ctx.send({
        data: pendingItems,
        meta: {
          total: pendingItems.length,
          totalAmount: pendingItems.reduce((sum, item) => sum + parseFloat(item.amount), 0)
        }
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async regenerateSchedule(ctx) {
    const { enrollmentId } = ctx.params;
    const { paymentPreference } = ctx.request.body;

    try {
      // Update enrollment payment preference if provided
      if (paymentPreference) {
        await strapi.entityService.update('api::enrollment.enrollment', enrollmentId, {
          data: { payment_preference: paymentPreference }
        });
      }

      // Delete existing schedule and items
      const existingSchedule = await strapi.entityService.findMany('api::payment-schedule.payment-schedule', {
        filters: { enrollment: enrollmentId },
        populate: ['payment_items']
      });

      if (existingSchedule.length > 0) {
        // Delete payment items
        for (const item of existingSchedule[0].payment_items) {
          await strapi.entityService.delete('api::payment-item.payment-item', item.id);
        }
        // Delete schedule
        await strapi.entityService.delete('api::payment-schedule.payment-schedule', existingSchedule[0].id);
      }

      // Regenerate schedule
      const newSchedule = await strapi.service('api::payment-schedule.payment-schedule').generateSchedule(enrollmentId);

      return ctx.send({
        data: newSchedule,
        message: 'Payment schedule regenerated successfully'
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async getScheduleSummary(ctx) {
    const { scheduleId } = ctx.params;

    try {
      const schedule = await strapi.entityService.findOne('api::payment-schedule.payment-schedule', scheduleId, {
        populate: {
          payment_items: {
            populate: ['fee_definition']
          },
          enrollment: {
            populate: ['student', 'class', 'academic_year']
          }
        }
      });

      if (!schedule) {
        return ctx.notFound('Payment schedule not found');
      }

      // Group items by status
      const summary = {
        schedule,
        stats: {
          totalItems: schedule.payment_items.length,
          paidItems: schedule.payment_items.filter(item => item.status === 'paid').length,
          pendingItems: schedule.payment_items.filter(item => item.status === 'pending').length,
          overdueItems: schedule.payment_items.filter(item =>
            item.status === 'pending' && new Date(item.due_date) < new Date()
          ).length,
          totalAmount: schedule.total_amount,
          paidAmount: schedule.paid_amount,
          pendingAmount: schedule.total_amount - schedule.paid_amount
        }
      };

      return ctx.send({ data: summary });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async previewSchedule(ctx) {
    const { enrollmentId } = ctx.params;

    try {
      const preview = await strapi.service('api::payment-schedule.payment-schedule').previewSchedule(enrollmentId);

      return ctx.send({
        data: preview,
        meta: {
          message: 'This is a preview of the payment schedule. No data has been saved yet.'
        }
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async createSchedule(ctx) {
    const { enrollmentId } = ctx.params;

    try {
      // Check if schedule already exists
      const existingSchedule = await strapi.entityService.findMany('api::payment-schedule.payment-schedule', {
        filters: { enrollment: enrollmentId },
        limit: 1
      });

      if (existingSchedule && existingSchedule.length > 0) {
        return ctx.badRequest('Payment schedule already exists for this enrollment');
      }

      // Generate the schedule
      const schedule = await strapi.service('api::payment-schedule.payment-schedule').generateSchedule(enrollmentId);

      return ctx.send({
        data: schedule,
        meta: {
          message: 'Payment schedule created successfully'
        }
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async processBatchPayment(ctx) {
    try {
      const { itemIds, paymentMethod, amount, referenceNumber, notes, paymentDate } = ctx.request.body;

      // Validate required fields
      if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
        return ctx.badRequest('Payment item IDs are required');
      }

      if (!paymentMethod) {
        return ctx.badRequest('Payment method is required');
      }

      if (!amount || amount <= 0) {
        return ctx.badRequest('Valid payment amount is required');
      }

      // Process batch payment
      const result = await strapi
        .service('api::payment-schedule.payment-schedule')
        .processBatchPayment({
          itemIds,
          paymentMethod,
          amount,
          referenceNumber,
          notes,
          paymentDate: paymentDate || new Date().toISOString()
        });

      return ctx.send({
        data: result,
        message: 'Payment processed successfully'
      });
    } catch (error) {
      strapi.log.error('Error processing batch payment:', error);
      return ctx.badRequest(error.message || 'Failed to process batch payment');
    }
  },

  async generateAllMissingSchedules(ctx) {
    try {
      // Get all enrollments
      const enrollments = await strapi.entityService.findMany('api::enrollment.enrollment', {
        populate: ['student', 'academic_year']
      });

      console.log(`Found ${enrollments.length} total enrollments`);

      // Get all existing schedules
      const existingSchedules = await strapi.entityService.findMany('api::payment-schedule.payment-schedule', {
        populate: ['enrollment']
      });

      const enrollmentsWithSchedules = new Set(existingSchedules.map(s => s.enrollment?.id).filter(Boolean));

      // Find enrollments without schedules
      const enrollmentsWithoutSchedules = enrollments.filter(e => !enrollmentsWithSchedules.has(e.id));

      console.log(`Found ${enrollmentsWithoutSchedules.length} enrollments without schedules`);

      const generated = [];
      const failed = [];

      // Generate schedules for enrollments without them
      for (const enrollment of enrollmentsWithoutSchedules) {
        try {
          console.log(`Generating schedule for enrollment ${enrollment.id} (Student: ${enrollment.student?.first_name} ${enrollment.student?.last_name})`);
          const schedule = await strapi.service('api::payment-schedule.payment-schedule').generateSchedule(enrollment.id);
          generated.push({
            enrollmentId: enrollment.id,
            scheduleId: schedule.id,
            student: `${enrollment.student?.first_name} ${enrollment.student?.last_name}`
          });
        } catch (error) {
          console.error(`Failed to generate schedule for enrollment ${enrollment.id}:`, error.message);
          failed.push({
            enrollmentId: enrollment.id,
            student: `${enrollment.student?.first_name} ${enrollment.student?.last_name}`,
            error: error.message
          });
        }
      }

      return ctx.send({
        data: {
          generated,
          failed
        },
        meta: {
          totalEnrollments: enrollments.length,
          enrollmentsWithSchedules: enrollmentsWithSchedules.size,
          enrollmentsWithoutSchedules: enrollmentsWithoutSchedules.length,
          successfullyGenerated: generated.length,
          failedToGenerate: failed.length
        }
      });
    } catch (error) {
      console.error('Error generating missing schedules:', error);
      return ctx.badRequest(error.message);
    }
  }
}));