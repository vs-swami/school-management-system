import { EnrollmentRepository } from '../repositories/EnrollmentRepository';
import { EnrollmentMapper } from '../mappers/EnrollmentMapper';

export class EnrollmentRepositoryAdapter {
  constructor() {
    this.repository = EnrollmentRepository;
  }

  async findAll(filters = {}) {
    const data = await this.repository.getAllEnrollments(filters);
    return EnrollmentMapper.toDomainList(data);
  }

  async findById(id) {
    const data = await this.repository.getEnrollmentById(id);
    return EnrollmentMapper.toDomain(data);
  }

  async findByStudent(studentId) {
    // The repository doesn't have this method, so we'll use getAllEnrollments with a filter
    const allEnrollments = await this.repository.getAllEnrollments();
    const filteredData = allEnrollments.filter(e => e.student?.id === studentId);
    return EnrollmentMapper.toDomainList(filteredData);
  }

  async findByClass(classId, divisionId = null) {
    // The repository doesn't have this method, so we'll use getAllEnrollments with a filter
    const allEnrollments = await this.repository.getAllEnrollments();
    let filteredData = allEnrollments.filter(e => e.class?.id === classId);

    // If divisionId is provided, also filter by division
    if (divisionId) {
      filteredData = filteredData.filter(e => e.administration?.division?.id === divisionId);
    }

    return EnrollmentMapper.toDomainList(filteredData);
  }

  async findByAcademicYear(yearId) {
    // The repository doesn't have this method, so we'll use getAllEnrollments with a filter
    const allEnrollments = await this.repository.getAllEnrollments();
    const filteredData = allEnrollments.filter(e => e.academic_year?.id === yearId);
    return EnrollmentMapper.toDomainList(filteredData);
  }

  async findByStatus(status) {
    // The repository doesn't have this method, so we'll use getAllEnrollments with a filter
    const allEnrollments = await this.repository.getAllEnrollments();
    const filteredData = allEnrollments.filter(e => e.enrollment_status === status);
    return EnrollmentMapper.toDomainList(filteredData);
  }

  async create(enrollmentData) {
    const apiData = EnrollmentMapper.toStrapi(enrollmentData);
    const result = await this.repository.createEnrollment(apiData);
    return EnrollmentMapper.toDomain(result);
  }

  async update(id, enrollmentData) {
    const apiData = EnrollmentMapper.toStrapi(enrollmentData);
    const result = await this.repository.updateEnrollment(id, apiData);
    return EnrollmentMapper.toDomain(result);
  }

  async delete(id) {
    return await this.repository.deleteEnrollment(id);
  }

  async getCurrentEnrollment(studentId) {
    // Repository doesn't have this method, so filter by student and get the first active one
    const allEnrollments = await this.repository.getAllEnrollments();
    const studentEnrollments = allEnrollments.filter(e => e.student?.id === studentId);
    const currentEnrollment = studentEnrollments.find(e =>
      e.enrollment_status === 'Processing' ||
      e.enrollment_status === 'Enrolled'
    ) || studentEnrollments[0];
    return EnrollmentMapper.toDomain(currentEnrollment);
  }

  async updateStatus(id, status) {
    const result = await this.repository.updateEnrollmentStatus(id, status);
    return EnrollmentMapper.toDomain(result);
  }

  async assignDivision(enrollmentId, divisionId) {
    const result = await this.repository.updateEnrollmentAdministration(enrollmentId, {
      division: divisionId
    });
    return EnrollmentMapper.toDomain(result);
  }
}