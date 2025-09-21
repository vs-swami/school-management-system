import { Division } from '../../domain/models/Division';
import { ClassMapper } from './ClassMapper';

export class DivisionMapper {
  static toDomain(strapiData) {
    if (!strapiData) return null;

    if (Array.isArray(strapiData)) {
      return strapiData.map(item => DivisionMapper.toDomain(item));
    }

    const data = strapiData.attributes || strapiData;

    return new Division({
      id: strapiData.id,
      documentId: strapiData.documentId || data.documentId,
      divisionName: data.name || data.divisionName,
      class: DivisionMapper.mapClass(data.class),
      teacher: DivisionMapper.mapTeacher(data.teacher),
      capacity: data.capacity || 0,
      isActive: data.is_active !== undefined ? data.is_active : data.isActive,
      students: DivisionMapper.mapStudents(data.students),
      schedule: DivisionMapper.mapSchedule(data.schedule),
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at
    });
  }

  static toDomainList(strapiDataList) {
    // Handle Strapi v5 response with data wrapper
    if (strapiDataList && strapiDataList.data !== undefined) {
      if (Array.isArray(strapiDataList.data)) {
        return strapiDataList.data.map(item => DivisionMapper.toDomain(item));
      } else if (strapiDataList.data) {
        return [DivisionMapper.toDomain(strapiDataList.data)];
      }
      return [];
    }

    if (!strapiDataList) return [];
    if (!Array.isArray(strapiDataList)) return [DivisionMapper.toDomain(strapiDataList)];
    return strapiDataList.map(item => DivisionMapper.toDomain(item));
  }

  static toAPI(domainModel) {
    if (!domainModel) return null;

    return {
      division_name: domainModel.divisionName,
      division_code: domainModel.divisionCode,
      class: domainModel.class?.id || domainModel.class,
      teacher: domainModel.teacher?.id || domainModel.teacher,
      capacity: domainModel.capacity,
      is_active: domainModel.isActive,
      schedule: domainModel.schedule
    };
  }

  static toStrapi(domainModel) {
    return DivisionMapper.toAPI(domainModel);
  }

  static mapClass(classData) {
    if (!classData) return null;
    const normalized = DivisionMapper.normalizeRelation(classData);
    const data = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!data) return null;

    // Avoid circular dependency - only return basic info
    // ClassMapper.mapDivisions already references DivisionMapper
    return {
      id: data.id,
      documentId: data.documentId,
      className: data.classname || data.className || data.class_name
    };
  }

  static mapTeacher(teacher) {
    if (!teacher) return null;
    const normalized = DivisionMapper.normalizeRelation(teacher);
    const data = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!data) return null;

    return {
      id: data.id,
      documentId: data.documentId,
      firstName: data.first_name || data.firstName,
      lastName: data.last_name || data.lastName,
      employeeId: data.employee_id || data.employeeId
    };
  }

  static mapStudents(students) {
    if (!students) return [];
    const normalized = DivisionMapper.normalizeRelation(students);
    if (!Array.isArray(normalized)) return [];

    // Return basic student info to avoid circular dependencies
    return normalized.map(student => ({
      id: student.id,
      documentId: student.documentId,
      firstName: student.first_name || student.firstName,
      lastName: student.last_name || student.lastName,
      rollNumber: student.roll_number || student.rollNumber
    }));
  }

  static mapSchedule(schedule) {
    if (!schedule) return [];
    if (!Array.isArray(schedule)) return [];

    return schedule.map(item => ({
      day: item.day,
      periods: item.periods || [],
      startTime: item.start_time || item.startTime,
      endTime: item.end_time || item.endTime
    }));
  }

  static normalizeRelation(relation) {
    if (!relation) return null;
    if (Array.isArray(relation)) return relation;
    if (relation.data) return Array.isArray(relation.data) ? relation.data : [relation.data];
    return relation;
  }
}