import { FeeTypeRepository } from '../repositories/FeeTypeRepository';
import { FeeTypeMapper } from '../mappers/FeeTypeMapper';

export class FeeTypeRepositoryAdapter {
  constructor() {
    this.repository = FeeTypeRepository;
  }

  async findAll() {
    const data = await this.repository.findAll();
    return FeeTypeMapper.toDomainList(data);
  }

  async findById(id) {
    const data = await this.repository.findById(id);
    return FeeTypeMapper.toDomain(data);
  }

  async findByCategory(category) {
    const data = await this.repository.findByCategory(category);
    return FeeTypeMapper.toDomainList(data);
  }

  async findActive() {
    const allData = await this.repository.findAll();
    const activeData = allData.filter(item => item.is_active !== false);
    return FeeTypeMapper.toDomainList(activeData);
  }

  async findByApplicability(entityType) {
    const allData = await this.repository.findAll();
    const filteredData = allData.filter(item =>
      item.applicable_to && item.applicable_to.includes(entityType)
    );
    return FeeTypeMapper.toDomainList(filteredData);
  }

  async create(feeTypeData) {
    const strapiData = FeeTypeMapper.toStrapi(feeTypeData);
    const result = await this.repository.create(strapiData);
    return FeeTypeMapper.toDomain(result);
  }

  async update(id, feeTypeData) {
    const strapiData = FeeTypeMapper.toStrapi(feeTypeData);
    const result = await this.repository.update(id, strapiData);
    return FeeTypeMapper.toDomain(result);
  }

  async delete(id) {
    return await this.repository.delete(id);
  }

  async activate(id) {
    const result = await this.repository.update(id, { is_active: true });
    return FeeTypeMapper.toDomain(result);
  }

  async deactivate(id) {
    const result = await this.repository.update(id, { is_active: false });
    return FeeTypeMapper.toDomain(result);
  }
}