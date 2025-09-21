import { BusStopRepository } from '../repositories/BusStopRepository';
import { BusStopMapper } from '../mappers/BusStopMapper';

export class BusStopRepositoryAdapter {
  constructor() {
    this.repository = BusStopRepository;
  }

  async findAll(filters = {}) {
    const data = await this.repository.findAll(filters);
    return BusStopMapper.toDomain(data);
  }

  async findById(id) {
    const data = await this.repository.findById(id);
    return BusStopMapper.toDomain(data);
  }

  async findByLocation(locationId) {
    const data = await this.repository.findByLocation(locationId);
    return BusStopMapper.toDomain(data);
  }

  async findByRoute(routeId) {
    const data = await this.repository.findByRoute(routeId);
    return BusStopMapper.toDomain(data);
  }

  async findActive() {
    const data = await this.repository.findActive();
    return BusStopMapper.toDomain(data);
  }

  async create(busStopData) {
    const apiData = BusStopMapper.toAPI(busStopData);
    const result = await this.repository.create(apiData);
    return BusStopMapper.toDomain(result);
  }

  async update(id, busStopData) {
    const apiData = BusStopMapper.toAPI(busStopData);
    const result = await this.repository.update(id, apiData);
    return BusStopMapper.toDomain(result);
  }

  async delete(id) {
    return await this.repository.delete(id);
  }

  async addStudentAllocation(stopId, studentId, allocationType) {
    const result = await this.repository.addStudentAllocation(stopId, studentId, allocationType);
    return BusStopMapper.toDomain(result);
  }

  async removeStudentAllocation(stopId, studentId, allocationType) {
    const result = await this.repository.removeStudentAllocation(stopId, studentId, allocationType);
    return BusStopMapper.toDomain(result);
  }

  async getStopCapacity(stopId) {
    return await this.repository.getStopCapacity(stopId);
  }

  async updateCoordinates(stopId, latitude, longitude) {
    const result = await this.repository.update(stopId, { latitude, longitude });
    return BusStopMapper.toDomain(result);
  }
}