'use strict';

/**
 * payment-schedule service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::payment-schedule.payment-schedule', ({ strapi }) => ({

  async previewSchedule(enrollmentId) {
    // Fetch enrollment with relations
    console.log(`Previewing payment schedule for enrollment ID: ${enrollmentId}`);
    const enrollment = await strapi.entityService.findOne('api::enrollment.enrollment', enrollmentId, {
      populate: {
        student: true,
        academic_year: true,
        administration: {
          populate: {
            division: {
              populate: {
                class: true
              }
            },
            seat_allocations: {
              populate: {
                pickup_stop: true
              }
            }
          }
        }
      }
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Extract class and bus_stop from the nested structure
    const enrollmentWithClass = {
      ...enrollment,
      class: enrollment.administration?.division?.class || null,
      bus_stop: enrollment.administration?.seat_allocations?.[0]?.pickup_stop || null
    };

    // Get all applicable fee assignments using the enrollment with extracted class
    const allFeeAssignments = await this.getApplicableFees(enrollmentWithClass);

    // Calculate payment items without creating them
    const previewItems = await this.calculatePaymentItems(
      allFeeAssignments,
      enrollment.payment_preference
    );

    return {
      enrollment,
      feeAssignments: allFeeAssignments,
      paymentItems: previewItems.items,
      totalAmount: previewItems.totalAmount,
      payment_preference: enrollment.payment_preference
    };
  },

  async calculatePaymentItems(feeAssignments, paymentPreference) {
    let totalAmount = 0;
    const items = [];

    for (const assignment of feeAssignments) {
      if (!assignment.fee) continue;

      const feeDefinition = await strapi.entityService.findOne('api::fee-definition.fee-definition', assignment.fee.id, {
        populate: ['type', 'installments']
      });

      const baseAmount = parseFloat(feeDefinition.base_amount);
      totalAmount += baseAmount;

      // For full payment or one-time fees
      if (paymentPreference === 'full' || feeDefinition.frequency === 'one_time') {
        items.push({
          fee_definition: feeDefinition,
          description: `${feeDefinition.name} - Full Payment`,
          amount: baseAmount,
          net_amount: baseAmount,
          due_date: this.calculateDueDate('full'),
          status: 'pending'
        });
      }
      // For installments payment
      else if (paymentPreference === 'installments') {
        // If fee has predefined installments, use them
        if (feeDefinition.installments && feeDefinition.installments.length > 0) {
          for (const installment of feeDefinition.installments) {
            items.push({
              fee_definition: feeDefinition,
              description: `${feeDefinition.name} - ${installment.label}`,
              amount: parseFloat(installment.amount),
              net_amount: parseFloat(installment.amount),
              due_date: installment.due_date || this.calculateDueDateByIndex(installment.index || 0, feeDefinition.frequency),
              installment_number: installment.index || null,
              status: 'pending'
            });
          }
        }
        // Otherwise create installments based on fee frequency
        else {
          if (feeDefinition.frequency === 'term' || feeDefinition.frequency === 'yearly') {
            // Create 3 term installments
            const termAmount = Math.ceil(baseAmount / 3);
            const termDates = this.getTermDates();

            for (let i = 0; i < 3; i++) {
              const isLastTerm = i === 2;
              const amount = isLastTerm ? (baseAmount - (termAmount * 2)) : termAmount;

              items.push({
                fee_definition: feeDefinition,
                description: `${feeDefinition.name} - Term ${i + 1}`,
                amount: amount,
                net_amount: amount,
                due_date: termDates[i],
                installment_number: i + 1,
                status: 'pending'
              });
            }
          } else if (feeDefinition.frequency === 'monthly') {
            // Create 10 monthly installments
            const monthlyAmount = Math.ceil(baseAmount / 10);
            const startDate = new Date();

            for (let i = 0; i < 10; i++) {
              const isLastMonth = i === 9;
              const amount = isLastMonth ? (baseAmount - (monthlyAmount * 9)) : monthlyAmount;
              const dueDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 5);

              items.push({
                fee_definition: feeDefinition,
                description: `${feeDefinition.name} - Month ${i + 1}`,
                amount: amount,
                net_amount: amount,
                due_date: dueDate,
                installment_number: i + 1,
                status: 'pending'
              });
            }
          }
        }
      }
    }

    return { items, totalAmount };
  },

  calculateDueDateByIndex(index, paymentPreference) {
    if (paymentPreference === 'term') {
      const termDates = this.getTermDates();
      return termDates[Math.min(index, termDates.length - 1)];
    } else if (paymentPreference === 'monthly') {
      const startDate = new Date();
      return new Date(startDate.getFullYear(), startDate.getMonth() + index, 5);
    }
    return this.calculateDueDate('full');
  },

  async generateSchedule(enrollmentId) {
    // Fetch enrollment with relations
    console.log(`Generating payment schedule for enrollment ID: ${enrollmentId}`);
    const enrollment = await strapi.entityService.findOne('api::enrollment.enrollment', enrollmentId, {
      populate: {
        student: true,
        academic_year: true,
        administration: {
          populate: {
            division: {
              populate: {
                class: true
              }
            },
            seat_allocations: {
              populate: {
                pickup_stop: true
              }
            }
          }
        }
      }
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Extract class and bus_stop from the nested structure
    const enrollmentWithClass = {
      ...enrollment,
      class: enrollment.administration?.division?.class || null,
      bus_stop: enrollment.administration?.seat_allocations?.[0]?.pickup_stop || null
    };

    // Check if schedule already exists
    const existingSchedule = await strapi.entityService.findMany('api::payment-schedule.payment-schedule', {
      filters: { enrollment: enrollmentId },
      limit: 1
    });

    if (existingSchedule && existingSchedule.length > 0) {
      return existingSchedule[0];
    }

    // Get all applicable fee assignments using the enrollment with extracted class
    const allFeeAssignments = await this.getApplicableFees(enrollmentWithClass);

    // Generate schedule number
    const scheduleNumber = `SCH-${enrollment.academic_year?.id || 'NA'}-${enrollmentId}-${Date.now()}`;

    // Create payment schedule
    const paymentSchedule = await strapi.entityService.create('api::payment-schedule.payment-schedule', {
      data: {
        schedule_number: scheduleNumber,
        enrollment: enrollmentId,
        total_amount: 0,
        paid_amount: 0,
        status: 'active',
        generated_at: new Date(),
        activated_at: new Date()
      }
    });

    // Generate payment items based on payment preference
    const { paymentItems, totalAmount } = await this.createPaymentItems(
      paymentSchedule.id,
      allFeeAssignments,
      enrollment.payment_preference
    );

    // Update schedule with total amount
    await strapi.entityService.update('api::payment-schedule.payment-schedule', paymentSchedule.id, {
      data: {
        total_amount: totalAmount
      }
    });

    return paymentSchedule;
  },

  async getApplicableFees(enrollment) {
    const feeAssignments = [];

    // Get class-based fees if class is available
    if (enrollment.class && enrollment.class.id) {
      const classFees = await strapi.entityService.findMany('api::fee-assignment.fee-assignment', {
        filters: {
          class: enrollment.class.id,
          $or: [
            { start_date: { $lte: new Date() } },
            { start_date: null }
          ],
          $or: [
            { end_date: { $gte: new Date() } },
            { end_date: null }
          ]
        },
        populate: ['fee']
      });
      feeAssignments.push(...classFees);
    } else {
      console.warn(`No class found for enrollment ${enrollment.id || 'unknown'}`);
    }

    // Get transport fees if applicable
    if (enrollment.admission_type === 'Transport' && enrollment.bus_stop && enrollment.bus_stop.id) {
      const transportFees = await strapi.entityService.findMany('api::fee-assignment.fee-assignment', {
        filters: {
          bus_stop: enrollment.bus_stop.id
        },
        populate: ['fee']
      });
      feeAssignments.push(...transportFees);
    }

    return feeAssignments;
  },

  async createPaymentItems(scheduleId, feeAssignments, paymentPreference) {
    let totalAmount = 0;
    const paymentItems = [];

    for (const assignment of feeAssignments) {
      if (!assignment.fee) continue;

      const feeDefinition = await strapi.entityService.findOne('api::fee-definition.fee-definition', assignment.fee.id, {
        populate: ['type', 'installments']
      });

      const baseAmount = parseFloat(feeDefinition.base_amount);
      totalAmount += baseAmount;

      // For full payment or one-time fees
      if (paymentPreference === 'full' || feeDefinition.frequency === 'one_time') {
        const paymentItem = await strapi.entityService.create('api::payment-item.payment-item', {
          data: {
            payment_schedule: scheduleId,
            fee_definition: feeDefinition.id,
            description: `${feeDefinition.name} - Full Payment`,
            amount: baseAmount,
            net_amount: baseAmount,
            due_date: this.calculateDueDate('full'),
            status: 'pending'
          }
        });
        paymentItems.push(paymentItem);
      }
      // For installments payment
      else if (paymentPreference === 'installments') {
        // If fee has predefined installments, use them
        if (feeDefinition.installments && feeDefinition.installments.length > 0) {
          for (const installment of feeDefinition.installments) {
            const paymentItem = await strapi.entityService.create('api::payment-item.payment-item', {
              data: {
                payment_schedule: scheduleId,
                fee_definition: feeDefinition.id,
                description: `${feeDefinition.name} - ${installment.label}`,
                amount: parseFloat(installment.amount),
                net_amount: parseFloat(installment.amount),
                due_date: installment.due_date || this.calculateDueDateByIndex(installment.index || 0, feeDefinition.frequency),
                installment_number: installment.index || null,
                status: 'pending'
              }
            });
            paymentItems.push(paymentItem);
          }
        }
        // Otherwise create installments based on fee frequency
        else {
          if (feeDefinition.frequency === 'term' || feeDefinition.frequency === 'yearly') {
            // Create 3 term installments
            const termAmount = Math.ceil(baseAmount / 3);
            const termDates = this.getTermDates();

            for (let i = 0; i < 3; i++) {
              const isLastTerm = i === 2;
              const amount = isLastTerm ? (baseAmount - (termAmount * 2)) : termAmount;

              const paymentItem = await strapi.entityService.create('api::payment-item.payment-item', {
                data: {
                  payment_schedule: scheduleId,
                  fee_definition: feeDefinition.id,
                  description: `${feeDefinition.name} - Term ${i + 1}`,
                  amount: amount,
                  net_amount: amount,
                  due_date: termDates[i],
                  installment_number: i + 1,
                  status: 'pending'
                }
              });
              paymentItems.push(paymentItem);
            }
          } else if (feeDefinition.frequency === 'monthly') {
            // Create 10 monthly installments
            const monthlyAmount = Math.ceil(baseAmount / 10);
            const startDate = new Date();

            for (let i = 0; i < 10; i++) {
              const isLastMonth = i === 9;
              const amount = isLastMonth ? (baseAmount - (monthlyAmount * 9)) : monthlyAmount;
              const dueDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 5);

              const paymentItem = await strapi.entityService.create('api::payment-item.payment-item', {
                data: {
                  payment_schedule: scheduleId,
                  fee_definition: feeDefinition.id,
                  description: `${feeDefinition.name} - Month ${i + 1}`,
                  amount: amount,
                  net_amount: amount,
                  due_date: dueDate,
                  installment_number: i + 1,
                  status: 'pending'
                }
              });
              paymentItems.push(paymentItem);
            }
          }
        }
      }
    }

    return { paymentItems, totalAmount };
  },

  calculateDueDate(type) {
    const now = new Date();
    if (type === 'full') {
      // Give 15 days for full payment
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15);
    }
    return now;
  },

  getTermDates() {
    const year = new Date().getFullYear();
    return [
      new Date(year, 3, 15),  // April 15 - Term 1
      new Date(year, 7, 15),  // August 15 - Term 2
      new Date(year, 11, 15)  // December 15 - Term 3
    ];
  },

  async getStudentSchedule(studentId) {
    // First, let's see all schedules without status filter
    const schedules = await strapi.entityService.findMany('api::payment-schedule.payment-schedule', {
      filters: {
        enrollment: {
          student: studentId
        }
        // Removed status filter to see all schedules
      },
      populate: {
        payment_items: true,
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

    console.log(`Found ${schedules.length} schedules for student ${studentId}`);
    return schedules;
  },

  async getPendingPayments() {
    const items = await strapi.entityService.findMany('api::payment-item.payment-item', {
      filters: {
        status: { $in: ['pending', 'partial'] }
      },
      populate: {
        payment_schedule: {
          populate: {
            enrollment: {
              populate: {
                student: true
              }
            }
          }
        },
        fee_definition: true
      }
    });

    // Add isOverdue flag to each item
    const itemsWithOverdueFlag = items.map(item => ({
      ...item,
      isOverdue: item.due_date && new Date(item.due_date) < new Date()
    }));

    return itemsWithOverdueFlag;
  },

  async processBatchPayment(paymentData) {
    const { itemIds, paymentMethod, amount, referenceNumber, notes, paymentDate } = paymentData;

    // Begin transaction
    const knex = strapi.db.connection;
    const trx = await knex.transaction();

    try {
      const transactions = [];
      const receiptNumber = `RCP-${Date.now()}`;
      let totalPaidAmount = 0;

      for (const itemId of itemIds) {
        // Get payment item with relations
        const item = await strapi.entityService.findOne('api::payment-item.payment-item', itemId, {
          populate: {
            payment_schedule: {
              populate: {
                enrollment: {
                  populate: ['student']
                }
              }
            },
            fee_definition: true
          }
        });

        if (!item) {
          throw new Error(`Payment item ${itemId} not found`);
        }

        // Create transaction record
        const transaction = await strapi.entityService.create('api::transaction.transaction', {
          data: {
            payment_item: itemId,
            amount: item.net_amount,
            payment_method: paymentMethod,
            reference_number: referenceNumber,
            notes: notes,
            status: 'completed',
            transaction_date: paymentDate || new Date(),
            receipt_number: receiptNumber,
            student: item.payment_schedule?.enrollment?.student?.id
          }
        }, { trx });

        // Update payment item status
        await strapi.entityService.update('api::payment-item.payment-item', itemId, {
          data: {
            status: 'paid',
            paid_amount: item.net_amount,
            payment_date: paymentDate || new Date()
          }
        }, { trx });

        // Update payment schedule paid amount
        if (item.payment_schedule) {
          const currentSchedule = await strapi.entityService.findOne(
            'api::payment-schedule.payment-schedule',
            item.payment_schedule.id
          );

          await strapi.entityService.update('api::payment-schedule.payment-schedule', item.payment_schedule.id, {
            data: {
              paid_amount: (currentSchedule.paid_amount || 0) + item.net_amount,
              status: ((currentSchedule.paid_amount || 0) + item.net_amount) >= currentSchedule.total_amount ? 'completed' : 'active'
            }
          }, { trx });
        }

        totalPaidAmount += item.net_amount;
        transactions.push(transaction);
      }

      // Commit transaction
      await trx.commit();

      return {
        success: true,
        transactions,
        receiptNumber,
        amount: totalPaidAmount,
        paymentMethod,
        referenceNumber,
        date: paymentDate || new Date()
      };

    } catch (error) {
      // Rollback transaction on error
      await trx.rollback();
      throw error;
    }
  }
}));