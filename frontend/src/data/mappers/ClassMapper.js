import { Class } from '../../domain/models/Class';
import { DivisionMapper } from './DivisionMapper';
import { EnrollmentMapper } from './EnrollmentMapper';
import { ExamResultMapper } from './ExamResultMapper';

export class ClassMapper {
  static toDomain(strapiData) {
    if (!strapiData) return null;

    // Handle Strapi v5 response with data wrapper
    if (strapiData.data !== undefined) {
      if (Array.isArray(strapiData.data)) {
        return strapiData.data.map(item => ClassMapper.toDomain(item));
      } else if (strapiData.data) {
        return ClassMapper.toDomain(strapiData.data);
      }
      return null;
    }

    if (Array.isArray(strapiData)) {
      return strapiData.map(item => ClassMapper.toDomain(item));
    }

    // Handle Strapi 5 response structure
    const data = strapiData.attributes || strapiData;

    return new Class({
      id: strapiData.id,
      documentId: strapiData.documentId || data.documentId,
      classname: data.classname || data.className || data.class_name,
      className: data.classname || data.className || data.class_name,
      classCode: data.class_code || data.classCode,
      description: data.description,
      isActive: data.is_active !== undefined ? data.is_active : data.isActive,
      capacity: data.capacity,
      divisions: ClassMapper.mapDivisions(data.divisions),
      enrollments: ClassMapper.mapEnrollments(data.enrollments),
      feeAssignments: ClassMapper.mapFeeAssignments(data.fee_assignments || data.feeAssignments),
      examResults: ClassMapper.mapExamResults(data.exam_results || data.examResults),
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at
    });
  }

  static toAPI(domainModel) {
    if (!domainModel) return null;

    return {
      classname: domainModel.className,
      class_code: domainModel.classCode,
      description: domainModel.description,
      is_active: domainModel.isActive,
      capacity: domainModel.capacity,
      divisions: domainModel.divisions?.map(d => d.id || d),
      enrollments: domainModel.enrollments?.map(e => e.id || e),
      fee_assignments: domainModel.feeAssignments?.map(f => f.id || f),
      exam_results: domainModel.examResults?.map(e => e.id || e)
    };
  }

  static mapDivisions(divisions) {
    if (!divisions) return [];
    const normalizedDivisions = ClassMapper.normalizeRelation(divisions);
    if (!Array.isArray(normalizedDivisions)) return [];

    // Avoid circular dependency by only returning basic info
    // DivisionMapper might reference ClassMapper
    return normalizedDivisions.map(division => ({
      id: division.id,
      documentId: division.documentId,
      divisionName: division.division_name || division.divisionName,
      divisionCode: division.division_code || division.divisionCode,
      capacity: division.capacity,
      studentCount: division.student_count || division.studentCount || 0
    }));
  }

  static mapEnrollments(enrollments) {
    if (!enrollments) return [];
    const normalizedEnrollments = ClassMapper.normalizeRelation(enrollments);
    if (!Array.isArray(normalizedEnrollments)) return [];

    // Avoid circular dependency by only returning basic info
    // EnrollmentMapper references ClassMapper
    return normalizedEnrollments.map(enrollment => ({
      id: enrollment.id,
      documentId: enrollment.documentId,
      studentId: enrollment.student?.id || enrollment.student,
      academicYear: enrollment.academic_year || enrollment.academicYear,
      isActive: enrollment.is_active !== undefined ? enrollment.is_active : enrollment.isActive
    }));
  }

  static mapFeeAssignments(feeAssignments) {
    if (!feeAssignments) return [];
    const normalizedAssignments = ClassMapper.normalizeRelation(feeAssignments);
    if (!Array.isArray(normalizedAssignments)) return [];

    return normalizedAssignments.map(assignment => ({
      id: assignment.id,
      documentId: assignment.documentId,
      feeDefinition: assignment.fee_definition || assignment.feeDefinition,
      amount: assignment.amount,
      dueDate: assignment.due_date || assignment.dueDate
    }));
  }

  static mapExamResults(examResults) {
    if (!examResults) return [];
    const normalizedResults = ClassMapper.normalizeRelation(examResults);
    if (!Array.isArray(normalizedResults)) return [];

    return normalizedResults.map(result => ExamResultMapper.toDomain(result));
  }

  static normalizeRelation(relation) {
    if (!relation) return [];
    if (Array.isArray(relation)) return relation;
    if (relation.data) return Array.isArray(relation.data) ? relation.data : [relation.data];
    return [relation];
  }
}