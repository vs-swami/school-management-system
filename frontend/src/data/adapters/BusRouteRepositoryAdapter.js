import { BusRouteRepository } from '../repositories/BusRouteRepository';
import { BusRouteMapper } from '../mappers/BusRouteMapper';

export class BusRouteRepositoryAdapter {
  constructor() {
    this.repository = BusRouteRepository;
  }

  async findAll(filters = {}) {
    const data = await this.repository.findAll(filters);
    return BusRouteMapper.toDomainList(data);
  }

  async findById(id) {
    const data = await this.repository.findById(id);
    return BusRouteMapper.toDomain(data);
  }

  async findActiveRoutes() {
    const data = await this.repository.findActiveRoutes();
    return BusRouteMapper.toDomainList(data);
  }

  async findByBus(busId) {
    const data = await this.repository.findByBus(busId);
    return BusRouteMapper.toDomainList(data);
  }

  async create(routeData) {
    const apiData = BusRouteMapper.toStrapi(routeData);
    const result = await this.repository.create(apiData);
    return BusRouteMapper.toDomain(result);
  }

  async update(id, routeData) {
    const apiData = BusRouteMapper.toStrapi(routeData);
    const result = await this.repository.update(id, apiData);
    return BusRouteMapper.toDomain(result);
  }

  async delete(id) {
    return await this.repository.delete(id);
  }

  async addStop(routeId, stopId, order) {
    const result = await this.repository.addStop(routeId, stopId, order);
    return BusRouteMapper.toDomain(result);
  }

  async removeStop(routeId, stopId) {
    const result = await this.repository.removeStop(routeId, stopId);
    return BusRouteMapper.toDomain(result);
  }

  async reorderStops(routeId, stopIds) {
    const result = await this.repository.reorderStops(routeId, stopIds);
    return BusRouteMapper.toDomain(result);
  }

  async assignBus(routeId, busId) {
    const result = await this.repository.update(routeId, { bus: busId });
    return BusRouteMapper.toDomain(result);
  }

  async getRouteCapacity(routeId) {
    return await this.repository.getRouteCapacity(routeId);
  }

  async findByStop(stopId) {
    const data = await this.repository.findByStop(stopId);
    return BusRouteMapper.toDomainList(data);
  }

  async findByLocation(locationId) {
    const data = await this.repository.findByLocation(locationId);
    return BusRouteMapper.toDomainList(data);
  }
}