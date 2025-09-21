import { ExamResultRepository } from '../repositories/ExamResultRepository';
import { ExamResultMapper } from '../mappers/ExamResultMapper';

export class ExamResultRepositoryAdapter {
  constructor() {
    this.repository = ExamResultRepository;
  }

  async findAll(filters = {}) {
    // Repository doesn't have findAll, need to implement based on filters
    throw new Error('Not implemented - use findByStudent or findByClass');
  }

  async findById(id) {
    const data = await this.repository.getExamResultById(id);
    return ExamResultMapper.toDomain(data);
  }

  async findByStudent(studentId) {
    const data = await this.repository.getStudentExamResults(studentId);
    return ExamResultMapper.toDomainList(data);
  }

  async findByClass(classId) {
    const data = await this.repository.getClassExamResults(classId);
    return ExamResultMapper.toDomainList(data);
  }

  async findByExam(examId) {
    const data = await this.repository.findByExam(examId);
    return ExamResultMapper.toDomainList(data);
  }

  async findByAcademicYear(yearId) {
    const data = await this.repository.findByAcademicYear(yearId);
    return ExamResultMapper.toDomainList(data);
  }

  async create(examResultData) {
    const apiData = ExamResultMapper.toAPI(examResultData);
    const result = await this.repository.createExamResult(apiData);
    return ExamResultMapper.toDomain(result);
  }

  async update(id, examResultData) {
    const apiData = ExamResultMapper.toAPI(examResultData);
    const result = await this.repository.updateExamResult(id, apiData);
    return ExamResultMapper.toDomain(result);
  }

  async delete(id) {
    return await this.repository.deleteExamResult(id);
  }

  async bulkCreate(examResults) {
    const apiData = examResults.map(result => ExamResultMapper.toAPI(result));
    const results = await this.repository.bulkCreateExamResults(apiData);
    return ExamResultMapper.toDomainList(results);
  }

  async getStudentPerformance(studentId, yearId) {
    const data = await this.repository.getStudentPerformance(studentId, yearId);
    return data;
  }

  async getClassPerformance(classId, examId) {
    const data = await this.repository.getClassPerformance(classId, examId);
    return data;
  }

  async updateGrade(resultId, grade, remarks) {
    const result = await this.repository.update(resultId, { grade, remarks });
    return ExamResultMapper.toDomain(result);
  }
}