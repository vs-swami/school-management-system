import { FeeDefinitionRepository } from '../repositories/FeeDefinitionRepository';
import { FeeAssignmentRepository } from '../repositories/FeeAssignmentRepository';
import { FeeMapper } from '../mappers/FeeMapper';

export class FeeRepositoryAdapter {
  constructor() {
    this.definitionRepository = FeeDefinitionRepository;
    this.assignmentRepository = FeeAssignmentRepository;
  }

  // Fee Definition methods
  async findAllDefinitions(filters = {}) {
    const data = await this.definitionRepository.findAll(filters);
    return FeeMapper.definitionToDomainList(data);
  }

  async findDefinitionById(id) {
    const data = await this.definitionRepository.findById(id);
    return FeeMapper.definitionToDomain(data);
  }

  async createDefinition(definitionData) {
    console.log('FeeRepositoryAdapter.createDefinition - Input:', definitionData);
    const apiData = FeeMapper.definitionToStrapi(definitionData);
    console.log('FeeRepositoryAdapter.createDefinition - API data to send:', apiData);

    const result = await this.definitionRepository.create(apiData);
    console.log('FeeRepositoryAdapter.createDefinition - Result from API:', JSON.stringify(result, null, 2));

    const domainModel = FeeMapper.definitionToDomain(result);
    console.log('FeeRepositoryAdapter.createDefinition - Mapped to domain:', JSON.stringify(domainModel, null, 2));

    return domainModel;
  }

  async updateDefinition(id, definitionData) {
    const apiData = FeeMapper.definitionToStrapi(definitionData);
    const result = await this.definitionRepository.update(id, apiData);
    return FeeMapper.definitionToDomain(result);
  }

  async deleteDefinition(id) {
    return await this.definitionRepository.delete(id);
  }

  // Fee Assignment methods
  async findAllAssignments(filters = {}) {
    const data = await this.assignmentRepository.findAll(filters);
    return FeeMapper.assignmentToDomainList(data);
  }

  async findAssignmentById(id) {
    const data = await this.assignmentRepository.findById(id);
    return FeeMapper.assignmentToDomain(data);
  }

  async findAssignmentsByClass(classId) {
    const data = await this.assignmentRepository.findByClass(classId);
    console.log('FeeRepositoryAdapter.findAssignmentsByClass - Output:', data);
    return FeeMapper.assignmentToDomainList(data);
  }

  async findAssignmentsByStudent(studentId) {
    const data = await this.assignmentRepository.findByStudent(studentId);
    return FeeMapper.assignmentToDomainList(data);
  }

  async findAssignmentsByBusStop(busStopId) {
    const data = await this.assignmentRepository.findByBusStop(busStopId);
    return FeeMapper.assignmentToDomainList(data);
  }

  async createAssignment(assignmentData) {
    const apiData = FeeMapper.assignmentToStrapi(assignmentData);
    const result = await this.assignmentRepository.create(apiData);
    return FeeMapper.assignmentToDomain(result);
  }

  async updateAssignment(id, assignmentData) {
    const apiData = FeeMapper.assignmentToStrapi(assignmentData);
    const result = await this.assignmentRepository.update(id, apiData);
    return FeeMapper.assignmentToDomain(result);
  }

  async deleteAssignment(id) {
    return await this.assignmentRepository.delete(id);
  }

  // Combined methods
  async findAllTypes() {
    // This should use FeeTypeRepository if available
    const data = await this.definitionRepository.findAll();
    const types = [...new Set(data.map(d => d.type))];
    return types;
  }

  async getStudentFeeStatus(studentId) {
    const assignments = await this.assignmentRepository.findByStudent(studentId);
    // Calculate status based on assignments
    return {
      total: assignments.reduce((sum, a) => sum + (a.amount || 0), 0),
      paid: 0, // Would need payment tracking
      pending: assignments.reduce((sum, a) => sum + (a.amount || 0), 0),
      assignments: FeeMapper.assignmentToDomainList(assignments)
    };
  }

  async getClassFeeCollection(classId) {
    const assignments = await this.assignmentRepository.findByClass(classId);
    return {
      totalAssigned: assignments.reduce((sum, a) => sum + (a.amount || 0), 0),
      totalCollected: 0, // Would need payment tracking
      assignments: FeeMapper.assignmentToDomainList(assignments)
    };
  }

  async applyFeeToStudents(feeAssignmentId, studentIds) {
    // This would need to be implemented based on business logic
    const results = await Promise.all(
      studentIds.map(studentId =>
        this.assignmentRepository.create({
          fee_definition: feeAssignmentId,
          student: studentId
        })
      )
    );
    return results;
  }

  async exemptStudentFromFee(feeAssignmentId, studentId, reason) {
    const result = await this.assignmentRepository.update(feeAssignmentId, {
      exempted: true,
      exemption_reason: reason,
      student: studentId
    });
    return FeeMapper.assignmentToDomain(result);
  }
}