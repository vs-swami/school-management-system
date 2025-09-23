import { PaymentScheduleRepositoryAdapter } from '../../data/adapters/PaymentScheduleRepositoryAdapter';

export class PaymentScheduleService {
  constructor() {
    this.repository = new PaymentScheduleRepositoryAdapter();
  }

  async getStudentPaymentSchedule(studentId) {
    try {
      const schedules = await this.repository.findByStudent(studentId);
      return {
        success: true,
        data: schedules
      };
    } catch (error) {
      console.error('Error in PaymentScheduleService.getStudentPaymentSchedule:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to fetch payment schedules';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Alias method for consistency
  async getStudentSchedule(studentId) {
    return this.getStudentPaymentSchedule(studentId);
  }

  async getPendingPayments() {
    try {
      const pendingItems = await this.repository.findPending();
      return {
        success: true,
        data: pendingItems
      };
    } catch (error) {
      console.error('Error in PaymentScheduleService.getPendingPayments:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to fetch pending payments';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async regenerateSchedule(enrollmentId, paymentPreference) {
    try {
      const schedule = await this.repository.regenerate(enrollmentId, paymentPreference);
      return {
        success: true,
        data: schedule,
        message: 'Payment schedule regenerated successfully'
      };
    } catch (error) {
      console.error('Error in PaymentScheduleService.regenerateSchedule:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to regenerate payment schedule';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getScheduleSummary(scheduleId) {
    try {
      const summary = await this.repository.getSummary(scheduleId);
      return {
        success: true,
        data: summary
      };
    } catch (error) {
      console.error('Error in PaymentScheduleService.getScheduleSummary:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to fetch schedule summary';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getAllSchedules(filters = {}) {
    try {
      const schedules = await this.repository.findAll(filters);
      return {
        success: true,
        data: schedules
      };
    } catch (error) {
      console.error('Error in PaymentScheduleService.getAllSchedules:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to fetch payment schedules';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getScheduleById(id) {
    try {
      const schedule = await this.repository.findById(id);
      return {
        success: true,
        data: schedule
      };
    } catch (error) {
      console.error('Error in PaymentScheduleService.getScheduleById:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to fetch payment schedule';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async updateSchedule(id, scheduleData) {
    try {
      const schedule = await this.repository.update(id, scheduleData);
      return {
        success: true,
        data: schedule,
        message: 'Payment schedule updated successfully'
      };
    } catch (error) {
      console.error('Error in PaymentScheduleService.updateSchedule:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to update payment schedule';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Helper method to calculate payment statistics
  calculatePaymentStats(schedule) {
    if (!schedule) return null;

    const totalItems = schedule.paymentItems?.length || 0;
    const paidItems = schedule.paymentItems?.filter(item => item.status === 'paid').length || 0;
    const overdueItems = schedule.paymentItems?.filter(item => item.isOverdue).length || 0;

    return {
      totalAmount: schedule.totalAmount,
      paidAmount: schedule.paidAmount,
      pendingAmount: schedule.pendingAmount,
      progressPercentage: schedule.progressPercentage,
      totalItems,
      paidItems,
      pendingItems: totalItems - paidItems,
      overdueItems,
      isFullyPaid: schedule.isFullyPaid(),
      hasOverdue: schedule.isOverdue()
    };
  }

  // Get schedules with overdue payments
  async getOverdueSchedules() {
    try {
      const schedules = await this.repository.findAll();
      const overdueSchedules = schedules.filter(schedule => schedule.isOverdue());

      return {
        success: true,
        data: overdueSchedules,
        meta: {
          total: overdueSchedules.length
        }
      };
    } catch (error) {
      console.error('Error in PaymentScheduleService.getOverdueSchedules:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to fetch overdue schedules';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Preview payment schedule for an enrollment
  async previewSchedule(enrollmentId) {
    try {
      const preview = await this.repository.previewSchedule(enrollmentId);
      return {
        success: true,
        data: preview
      };
    } catch (error) {
      console.error('Error in PaymentScheduleService.previewSchedule:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to preview payment schedule';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Create payment schedule for an enrollment
  async createSchedule(enrollmentId) {
    try {
      const schedule = await this.repository.createSchedule(enrollmentId);
      return {
        success: true,
        data: schedule,
        message: 'Payment schedule created successfully'
      };
    } catch (error) {
      console.error('Error in PaymentScheduleService.createSchedule:', error);
      const errorMessage = error?.response?.data?.error?.message ||
                          error?.message ||
                          'Failed to create payment schedule';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}