import { AcademicYearRepository } from '../repositories/AcademicYearRepository';
import { AcademicYearMapper } from '../mappers/AcademicYearMapper';

export class AcademicYearRepositoryAdapter {
  constructor() {
    this.repository = AcademicYearRepository;
  }

  async findAll() {
    const data = await this.repository.findAll();
    return AcademicYearMapper.toDomainList(data);
  }

  async findById(id) {
    const data = await this.repository.findById(id);
    return AcademicYearMapper.toDomain(data);
  }

  async findCurrent() {
    const data = await this.repository.findCurrent();
    return AcademicYearMapper.toDomain(data);
  }

  async findByYear(year) {
    const allData = await this.repository.findAll();
    const yearData = allData.find(item => item.year === year);
    return AcademicYearMapper.toDomain(yearData);
  }

  async findActive() {
    const allData = await this.repository.findAll();
    const activeData = allData.filter(item => item.is_active !== false);
    return AcademicYearMapper.toDomainList(activeData);
  }

  async findByDateRange(startDate, endDate) {
    const allData = await this.repository.findAll();
    const filteredData = allData.filter(item => {
      const itemStart = new Date(item.start_date);
      const itemEnd = new Date(item.end_date);
      const queryStart = new Date(startDate);
      const queryEnd = new Date(endDate);

      return (
        (itemStart >= queryStart && itemStart <= queryEnd) ||
        (itemEnd >= queryStart && itemEnd <= queryEnd) ||
        (itemStart <= queryStart && itemEnd >= queryEnd)
      );
    });
    return AcademicYearMapper.toDomainList(filteredData);
  }

  async create(academicYearData) {
    const strapiData = AcademicYearMapper.toStrapi(academicYearData);
    const result = await this.repository.create(strapiData);
    return AcademicYearMapper.toDomain(result);
  }

  async update(id, academicYearData) {
    const strapiData = AcademicYearMapper.toStrapi(academicYearData);
    const result = await this.repository.update(id, strapiData);
    return AcademicYearMapper.toDomain(result);
  }

  async delete(id) {
    return await this.repository.delete(id);
  }

  async setCurrent(id) {
    // First, unset all current years
    const allYears = await this.repository.findAll();
    const updatePromises = allYears
      .filter(year => year.is_current)
      .map(year => this.repository.update(year.id, { is_current: false }));

    await Promise.all(updatePromises);

    // Then set the specified year as current
    const result = await this.repository.update(id, { is_current: true });
    return AcademicYearMapper.toDomain(result);
  }
}