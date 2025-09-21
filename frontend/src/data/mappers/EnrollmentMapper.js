import { Enrollment } from '../../domain/models/Enrollment';
import { ClassMapper } from './ClassMapper';
import { DivisionMapper } from './DivisionMapper';
import { AcademicYearMapper } from './AcademicYearMapper';
import { StudentMapper } from './StudentMapper';
import { EnrollmentAdministrationMapper } from './EnrollmentAdministrationMapper';

export class EnrollmentMapper {
  static toDomain(strapiData) {
    if (!strapiData) return null;

    if (Array.isArray(strapiData)) {
      return strapiData.map(item => EnrollmentMapper.toDomain(item));
    }

    const data = strapiData.attributes || strapiData;

    return new Enrollment({
      id: strapiData.id,
      documentId: strapiData.documentId || data.documentId,
      // Relations
      student: EnrollmentMapper.mapStudent(data.student),
      class: EnrollmentMapper.mapClass(data.class),
      academicYear: EnrollmentMapper.mapAcademicYear(data.academic_year),
      administration: EnrollmentMapper.mapAdministration(data.administration),
      // Core fields matching schema
      grNo: data.gr_no,
      dateEnrolled: data.date_enrolled,
      enrollmentStatus: data.enrollment_status,
      admissionType: data.admission_type,
      lcReceived: data.lc_received,
      // Timestamps
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at
    });
  }

  static toAPI(domainModel) {
    if (!domainModel) return null;

    return {
      student: domainModel.student?.id || domainModel.student,
      class: domainModel.class?.id || domainModel.class,
      academic_year: domainModel.academicYear?.id || domainModel.academicYear || domainModel.academic_year,
      gr_no: domainModel.grNo || domainModel.gr_no,
      date_enrolled: domainModel.dateEnrolled || domainModel.date_enrolled,
      enrollment_status: domainModel.enrollmentStatus || domainModel.enrollment_status,
      admission_type: domainModel.admissionType || domainModel.admission_type,
      lc_received: domainModel.lcReceived || domainModel.lc_received,
      administration: domainModel.administration?.id || domainModel.administration
    };
  }

  static toStrapi(domainModel) {
    return EnrollmentMapper.toAPI(domainModel);
  }

  static toDomainList(strapiDataList) {
    if (!strapiDataList) return [];
    if (!Array.isArray(strapiDataList)) return [EnrollmentMapper.toDomain(strapiDataList)];
    return strapiDataList.map(item => EnrollmentMapper.toDomain(item));
  }

  static mapStudent(student) {
    if (!student) return null;
    const normalized = EnrollmentMapper.normalizeRelation(student);
    const data = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!data) return null;

    // Use StudentMapper for full mapping but avoid circular dependency
    // by only mapping basic fields here
    return {
      id: data.id,
      documentId: data.documentId,
      firstName: data.first_name || data.firstName,
      lastName: data.last_name || data.lastName,
      grFullName: data.gr_full_name
    };
  }

  static mapClass(classData) {
    if (!classData) return null;
    const normalized = EnrollmentMapper.normalizeRelation(classData);
    const data = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!data) return null;

    return ClassMapper.toDomain(data);
  }

  static mapDivision(division) {
    if (!division) return null;
    const normalized = EnrollmentMapper.normalizeRelation(division);
    const data = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!data) return null;

    return DivisionMapper.toDomain(data);
  }

  static mapAcademicYear(academicYear) {
    if (!academicYear) return null;
    const normalized = EnrollmentMapper.normalizeRelation(academicYear);
    const data = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!data) return null;

    return AcademicYearMapper.toDomain(data);
  }

  static mapAdministration(administration) {
    if (!administration) return null;
    const normalized = EnrollmentMapper.normalizeRelation(administration);
    const data = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!data) return null;

    return EnrollmentAdministrationMapper.toDomain(data);
  }

  static normalizeRelation(relation) {
    if (!relation) return null;
    if (Array.isArray(relation)) return relation;
    if (relation.data) return Array.isArray(relation.data) ? relation.data : [relation.data];
    return relation;
  }
}