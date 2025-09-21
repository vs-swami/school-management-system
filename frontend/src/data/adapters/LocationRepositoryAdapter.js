import { LocationRepository } from '../repositories/LocationRepository';
import { LocationMapper } from '../mappers/LocationMapper';

export class LocationRepositoryAdapter {
  constructor() {
    this.repository = LocationRepository;
  }

  async findAll(filters = {}) {
    const data = await this.repository.findAll(filters);
    return LocationMapper.toDomainList(data);
  }

  async findById(id) {
    const data = await this.repository.findById(id);
    return LocationMapper.toDomain(data);
  }

  async findByType(type) {
    const data = await this.repository.findByType(type);
    return LocationMapper.toDomainList(data);
  }

  async findByParent(parentId) {
    const data = await this.repository.findByParent(parentId);
    return LocationMapper.toDomainList(data);
  }

  async create(locationData) {
    const apiData = LocationMapper.toStrapi(locationData);
    const result = await this.repository.create(apiData);
    return LocationMapper.toDomain(result);
  }

  async update(id, locationData) {
    const apiData = LocationMapper.toStrapi(locationData);
    const result = await this.repository.update(id, apiData);
    return LocationMapper.toDomain(result);
  }

  async delete(id) {
    return await this.repository.delete(id);
  }

  async findActive() {
    const data = await this.repository.findActive();
    return LocationMapper.toDomainList(data);
  }

  async getLocationHierarchy(locationId) {
    const data = await this.repository.getLocationHierarchy(locationId);
    return LocationMapper.toDomainList(data);
  }

  async searchLocations(query) {
    const data = await this.repository.search(query);
    return LocationMapper.toDomainList(data);
  }
}