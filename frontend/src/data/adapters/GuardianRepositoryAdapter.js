import { GuardianRepository } from '../repositories/GuardianRepository';
import { GuardianMapper } from '../mappers/GuardianMapper';

export class GuardianRepositoryAdapter {
  constructor() {
    this.repository = GuardianRepository;
  }

  async findAll(filters = {}) {
    const data = await this.repository.findAll(filters);
    return GuardianMapper.toDomainList(data);
  }

  async findById(id) {
    const data = await this.repository.findById(id);
    return GuardianMapper.toDomain(data);
  }

  async findByStudent(studentId) {
    const data = await this.repository.findByStudent(studentId);
    return GuardianMapper.toDomainList(data);
  }

  async findByEmail(email) {
    const data = await this.repository.findByEmail(email);
    return GuardianMapper.toDomain(data);
  }

  async findByPhone(phone) {
    const data = await this.repository.findByPhone(phone);
    return GuardianMapper.toDomain(data);
  }

  async findPrimaryGuardians() {
    const data = await this.repository.findPrimaryGuardians();
    return GuardianMapper.toDomainList(data);
  }

  async findEmergencyContacts() {
    const data = await this.repository.findEmergencyContacts();
    return GuardianMapper.toDomainList(data);
  }

  async create(guardianData) {
    const apiData = GuardianMapper.toStrapi(guardianData);
    const result = await this.repository.create(apiData);
    return GuardianMapper.toDomain(result);
  }

  async update(id, guardianData) {
    const apiData = GuardianMapper.toStrapi(guardianData);
    const result = await this.repository.update(id, apiData);
    return GuardianMapper.toDomain(result);
  }

  async delete(id) {
    return await this.repository.delete(id);
  }

  async assignToStudent(guardianId, studentId) {
    const result = await this.repository.assignToStudent(guardianId, studentId);
    return GuardianMapper.toDomain(result);
  }

  async removeFromStudent(guardianId, studentId) {
    const result = await this.repository.removeFromStudent(guardianId, studentId);
    return GuardianMapper.toDomain(result);
  }

  async bulkCreate(guardiansData) {
    const apiData = guardiansData.map(guardian => GuardianMapper.toStrapi(guardian));
    const results = await this.repository.bulkCreate(apiData);
    return GuardianMapper.toDomainList(results);
  }

  async bulkUpdate(updates) {
    const apiUpdates = updates.map(({ id, data }) => ({
      id,
      data: GuardianMapper.toStrapi(data)
    }));
    const results = await this.repository.bulkUpdate(apiUpdates);
    return GuardianMapper.toDomainList(results);
  }

  async getStudentGuardianRelationship(studentId, guardianId) {
    const data = await this.repository.getStudentGuardianRelationship(studentId, guardianId);
    return data;
  }

  async updateContactPreferences(guardianId, preferences) {
    const result = await this.repository.update(guardianId, { contact_preferences: preferences });
    return GuardianMapper.toDomain(result);
  }
}