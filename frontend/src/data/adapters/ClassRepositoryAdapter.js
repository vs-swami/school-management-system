import { ClassRepository } from '../repositories/ClassRepository';
import { ClassMapper } from '../mappers/ClassMapper';

export class ClassRepositoryAdapter {
  constructor() {
    this.repository = ClassRepository;
  }

  async findAll(filters = {}) {
    const data = await this.repository.findAll(filters);
    return ClassMapper.toDomain(data);
  }

  async findById(id) {
    const data = await this.repository.findById(id);
    return ClassMapper.toDomain(data);
  }

  async findByDocumentId(documentId) {
    const data = await this.repository.findByDocumentId(documentId);
    return ClassMapper.toDomain(data);
  }

  async findByCode(classCode) {
    const data = await this.repository.findByCode(classCode);
    return ClassMapper.toDomain(data);
  }

  async create(classData) {
    const apiData = ClassMapper.toAPI(classData);
    const result = await this.repository.create(apiData);
    return ClassMapper.toDomain(result);
  }

  async update(id, classData) {
    const apiData = ClassMapper.toAPI(classData);
    const result = await this.repository.update(id, apiData);
    return ClassMapper.toDomain(result);
  }

  async delete(id) {
    return await this.repository.delete(id);
  }

  async findWithSummary() {
    // Use findAll with populate to get summary data
    const data = await this.repository.findAll({ populate: '*' });
    return ClassMapper.toDomain(data);
  }

  async findWithStats(id) {
    // Use findById with populate to get stats
    const data = await this.repository.findById(id, { populate: '*' });
    return ClassMapper.toDomain(data);
  }

  async findActiveClasses() {
    // Use findAll with status filter
    const data = await this.repository.findAll({
      filters: { status: { $eq: 'active' } },
      populate: '*'
    });
    return ClassMapper.toDomain(data);
  }

  async findByAcademicYear(academicYearId) {
    // Use findAll with academic year filter
    const data = await this.repository.findAll({
      filters: { academic_year: { id: { $eq: academicYearId } } },
      populate: '*'
    });
    return ClassMapper.toDomain(data);
  }

  async getClassMetrics(classId) {
    // Get class with all related data for metrics
    const classData = await this.repository.findById(classId, { populate: '*' });
    // Return basic metrics - actual metrics calculation should be in service layer
    return {
      id: classId,
      data: classData,
      totalStudents: 0, // These would be calculated from enrollments
      totalDivisions: 0
    };
  }

  async updateCapacity(classId, capacity) {
    const result = await this.repository.update(classId, { capacity });
    return ClassMapper.toDomain(result);
  }
}