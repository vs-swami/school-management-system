import { PaymentScheduleRepository } from '../repositories/PaymentScheduleRepository';
import { PaymentScheduleMapper } from '../mappers/PaymentScheduleMapper';

export class PaymentScheduleRepositoryAdapter {
  constructor() {
    this.repository = PaymentScheduleRepository;
  }

  async findByStudent(studentId) {
    const data = await this.repository.findByStudent(studentId);
    // Handle both wrapped and direct responses
    const schedules = data?.data || data;

    if (!schedules) return [];

    // Return all schedules mapped to domain, not just the first one
    if (Array.isArray(schedules)) {
      return schedules.map(schedule => PaymentScheduleMapper.toDomain(schedule));
    }

    // If single schedule, return as array
    return [PaymentScheduleMapper.toDomain(schedules)];
  }

  async findPending() {
    const response = await this.repository.findPending();
    // The API returns the data directly with data and meta properties
    if (!response?.data || !Array.isArray(response.data)) return [];

    // Return the raw response data - the component will handle the formatting
    return response.data;
  }

  async regenerate(enrollmentId, paymentPreference) {
    const data = await this.repository.regenerate(enrollmentId, paymentPreference);
    return PaymentScheduleMapper.toDomain(data?.data);
  }

  async getSummary(scheduleId) {
    const data = await this.repository.getSummary(scheduleId);
    return PaymentScheduleMapper.summaryToDomain(data);
  }

  async findAll(filters = {}) {
    const data = await this.repository.findAll(filters);
    return PaymentScheduleMapper.toDomainList(data);
  }

  async findById(id) {
    const data = await this.repository.findById(id);
    return PaymentScheduleMapper.toDomain(data);
  }

  async update(id, scheduleData) {
    const apiData = PaymentScheduleMapper.toStrapi(scheduleData);
    const result = await this.repository.update(id, apiData);
    return PaymentScheduleMapper.toDomain(result);
  }

  async previewSchedule(enrollmentId) {
    const data = await this.repository.previewSchedule(enrollmentId);
    return data?.data || data;
  }

  async createSchedule(enrollmentId) {
    const data = await this.repository.createSchedule(enrollmentId);
    return PaymentScheduleMapper.toDomain(data?.data);
  }
}