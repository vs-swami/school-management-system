import { StudentRepository } from '../repositories/StudentRepository';
import { StudentMapper } from '../mappers/StudentMapper';

export class StudentRepositoryAdapter {
  constructor() {
    this.repository = StudentRepository;
  }

  async findAll(filters = {}) {
    const data = await this.repository.findAll(filters);
    const mapped = StudentMapper.toDomainList(data);
    return mapped;
  }

  async findById(id) {
    const data = await this.repository.findById(id);
    return  StudentMapper.toDomain(data);
  }

  async findWithDetails(id) {
    const data = await this.repository.findWithDetails(id);
    return StudentMapper.toDomain(data);
  }

  async findByGrNo(grNo) {
    const data = await this.repository.findByGrNo(grNo);
    return StudentMapper.toDomain(data);
  }

  async create(studentData) {
    const apiData = StudentMapper.toStrapi(studentData);
    console.log('API Data for creation:', apiData);
    const result = await this.repository.create(apiData);
    return StudentMapper.toDomain(result);
  }

  async update(id, studentData) {
    const apiData = StudentMapper.toStrapi(studentData);
    const result = await this.repository.update(id, apiData);
    return StudentMapper.toDomain(result);
  }

  async delete(id) {
    return await this.repository.delete(id);
  }

  async findByClass(classId) {
    const data = await this.repository.findByClass(classId);
    return StudentMapper.toDomainList(data);
  }

  async findByDivision(divisionId) {
    const data = await this.repository.findByDivision(divisionId);
    return StudentMapper.toDomainList(data);
  }

  async findByEnrollmentStatus(status) {
    const data = await this.repository.findByEnrollmentStatus(status);
    return StudentMapper.toDomainList(data);
  }

  async searchStudents(query) {
    const data = await this.repository.search(query);
    return StudentMapper.toDomainList(data);
  }

  async getStatistics() {
    return await this.repository.getStatistics();
  }
}