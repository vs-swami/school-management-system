import { BusRepository } from '../repositories/BusRepository';
import { BusMapper } from '../mappers/BusMapper';

export class BusRepositoryAdapter {
  constructor() {
    this.repository = BusRepository;
  }

  async findAll() {
    const data = await this.repository.findAll();
    return BusMapper.toDomainList(data);
  }

  async findById(id) {
    const data = await this.repository.findById(id);
    return BusMapper.toDomain(data);
  }

  async findActive() {
    const data = await this.repository.findActive();
    return BusMapper.toDomainList(data);
  }

  async findByRoute(routeId) {
    const data = await this.repository.findByRoute(routeId);
    return BusMapper.toDomainList(data);
  }

  async findAvailable() {
    const data = await this.repository.findAvailable();
    return BusMapper.toDomainList(data);
  }

  async create(busData) {
    const strapiData = BusMapper.toStrapi(busData);
    const result = await this.repository.create(strapiData);
    return BusMapper.toDomain(result);
  }

  async update(id, busData) {
    const strapiData = BusMapper.toStrapi(busData);
    const result = await this.repository.update(id, strapiData);
    return BusMapper.toDomain(result);
  }

  async delete(id) {
    return await this.repository.delete(id);
  }

  async assignToRoute(busId, routeId) {
    const result = await this.repository.update(busId, { current_route: routeId });
    return BusMapper.toDomain(result);
  }

  async removeFromRoute(busId) {
    const result = await this.repository.update(busId, { current_route: null });
    return BusMapper.toDomain(result);
  }

  async updateMaintenance(busId, maintenanceDate) {
    const result = await this.repository.update(busId, { next_maintenance: maintenanceDate });
    return BusMapper.toDomain(result);
  }
}