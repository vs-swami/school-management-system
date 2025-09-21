import { DivisionRepository } from '../repositories/DivisionRepository';
import { DivisionMapper } from '../mappers/DivisionMapper';

export class DivisionRepositoryAdapter {
  constructor() {
    this.repository = DivisionRepository;
  }

  async findAll(filters = {}) {
    const data = await this.repository.findAll(filters);
    return DivisionMapper.toDomainList(data);
  }

  async findById(id) {
    const data = await this.repository.findById(id);
    return DivisionMapper.toDomain(data);
  }

  async findByClass(classId) {
    const data = await this.repository.findByClass(classId);
    return DivisionMapper.toDomainList(data);
  }

  async findByTeacher(teacherId) {
    const data = await this.repository.findByTeacher(teacherId);
    return DivisionMapper.toDomainList(data);
  }

  async create(divisionData) {
    const apiData = DivisionMapper.toStrapi(divisionData);
    const result = await this.repository.create(apiData);
    return DivisionMapper.toDomain(result);
  }

  async update(id, divisionData) {
    const apiData = DivisionMapper.toStrapi(divisionData);
    const result = await this.repository.update(id, apiData);
    return DivisionMapper.toDomain(result);
  }

  async delete(id) {
    return await this.repository.delete(id);
  }

  async getDivisionMetrics(divisionId) {
    return await this.repository.getDivisionMetrics(divisionId);
  }

  async getDivisionsByClass(classId) {
    const data = await this.repository.findByClass(classId);
    return DivisionMapper.toDomainList(data);
  }

  async assignTeacher(divisionId, teacherId) {
    const result = await this.repository.update(divisionId, { class_teacher: teacherId });
    return DivisionMapper.toDomain(result);
  }

  async getStudentCount(divisionId) {
    return await this.repository.getStudentCount(divisionId);
  }

  async getYearGroupComparison() {
    return await this.repository.getYearGroupComparison();
  }

  async getMetrics() {
    return await this.repository.getMetrics();
  }
}