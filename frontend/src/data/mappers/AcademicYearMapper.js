import { AcademicYear } from '../../domain/models/AcademicYear';

export class AcademicYearMapper {
  static toDomain(strapiData) {
    if (!strapiData) return null;

    return new AcademicYear({
      id: strapiData.id,
      year: strapiData.code || strapiData.year, // API uses 'code' field for year value
      startDate: strapiData.start_date || strapiData.starts_on,
      endDate: strapiData.end_date || strapiData.ends_on,
      isCurrent: strapiData.is_current,
      isActive: strapiData.is_active !== false,
      description: strapiData.description,
      totalWorkingDays: strapiData.total_working_days,
      terms: strapiData.terms || [],
      holidays: strapiData.holidays || [],
      createdAt: strapiData.createdAt,
      updatedAt: strapiData.updatedAt
    });
  }

  static toStrapi(domainModel) {
    if (!domainModel) return null;

    return {
      year: domainModel.year,
      start_date: domainModel.startDate,
      end_date: domainModel.endDate,
      is_current: domainModel.isCurrent,
      is_active: domainModel.isActive,
      description: domainModel.description,
      total_working_days: domainModel.totalWorkingDays,
      terms: domainModel.terms,
      holidays: domainModel.holidays
    };
  }

  static toDomainList(strapiDataList) {
    // Handle Strapi v5 response with data wrapper
    if (strapiDataList && strapiDataList.data !== undefined) {
      if (Array.isArray(strapiDataList.data)) {
        return strapiDataList.data.map(data => this.toDomain(data));
      }
      return [];
    }

    if (!Array.isArray(strapiDataList)) return [];
    return strapiDataList.map(data => this.toDomain(data));
  }
}