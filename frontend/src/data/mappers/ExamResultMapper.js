import { ExamResult } from '../../domain/models/ExamResult';
import { StudentMapper } from './StudentMapper';
import { ClassMapper } from './ClassMapper';
import { AcademicYearMapper } from './AcademicYearMapper';

export class ExamResultMapper {
  static toDomain(strapiData) {
    if (!strapiData) return null;

    // Handle Strapi v5 response with data wrapper
    if (strapiData.data !== undefined) {
      if (Array.isArray(strapiData.data)) {
        return strapiData.data.map(item => ExamResultMapper.toDomain(item));
      } else if (strapiData.data) {
        return ExamResultMapper.toDomain(strapiData.data);
      }
      return null;
    }

    if (Array.isArray(strapiData)) {
      return strapiData.map(item => ExamResultMapper.toDomain(item));
    }

    const data = strapiData.attributes || strapiData;

    // Map to new ExamResult model structure
    return new ExamResult({
      id: strapiData.id,
      documentId: strapiData.documentId || data.documentId,
      student: ExamResultMapper.mapStudent(data.student),
      exam_type: data.exam_type,
      exam_name: data.exam_name,
      exam_date: data.exam_date,
      subject_scores: data.subject_scores,
      total_obtained: data.total_obtained,
      total_maximum: data.total_maximum,
      overall_percentage: data.overall_percentage,
      overall_grade: data.overall_grade,
      rank: data.rank,
      remarks: data.remarks,
      academic_year: ExamResultMapper.mapAcademicYear(data.academic_year),
      class: ExamResultMapper.mapClass(data.class),
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at
    });
  }

  static toStrapi(domainModel) {
    return ExamResultMapper.toAPI(domainModel);
  }

  static toAPI(domainModel) {
    if (!domainModel) return null;

    // If it's an ExamResult instance, use its toApiFormat method
    if (domainModel instanceof ExamResult) {
      return domainModel.toApiFormat();
    }

    // Otherwise handle raw object
    const data = {
      exam_type: domainModel.examType || domainModel.exam_type,
      exam_name: domainModel.examName || domainModel.exam_name,
      exam_date: domainModel.examDate || domainModel.exam_date,
      subject_scores: domainModel.subjectScores || domainModel.subject_scores,
      total_obtained: domainModel.totalObtained || domainModel.total_obtained,
      total_maximum: domainModel.totalMaximum || domainModel.total_maximum,
      overall_percentage: domainModel.overallPercentage || domainModel.overall_percentage,
      overall_grade: domainModel.overallGrade || domainModel.overall_grade,
      rank: domainModel.rank,
      remarks: domainModel.remarks
    };

    // Add relations if present
    if (domainModel.student) {
      data.student = domainModel.student?.id || domainModel.student;
    }
    if (domainModel.academicYear || domainModel.academic_year) {
      data.academic_year = domainModel.academicYear?.id || domainModel.academic_year;
    }
    if (domainModel.class) {
      data.class = domainModel.class?.id || domainModel.class;
    }

    // Remove undefined fields
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    return data;
  }

  static mapStudent(student) {
    if (!student) return null;
    const normalized = ExamResultMapper.normalizeRelation(student);
    const data = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!data) return null;

    // Return basic info to avoid circular dependency
    // StudentMapper.mapExamResults references ExamResultMapper
    return {
      id: data.id,
      documentId: data.documentId,
      firstName: data.first_name || data.firstName,
      lastName: data.last_name || data.lastName,
      grFullName: data.gr_full_name
    };
  }

  static mapExam(exam) {
    if (!exam) return null;
    const normalized = ExamResultMapper.normalizeRelation(exam);
    const data = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!data) return null;

    return {
      id: data.id,
      documentId: data.documentId,
      name: data.name,
      type: data.type,
      date: data.date
    };
  }

  static mapClass(classData) {
    if (!classData) return null;
    const normalized = ExamResultMapper.normalizeRelation(classData);
    const data = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!data) return null;

    return ClassMapper.toDomain(data);
  }

  static mapAcademicYear(academicYear) {
    if (!academicYear) return null;
    const normalized = ExamResultMapper.normalizeRelation(academicYear);
    const data = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!data) return null;

    return AcademicYearMapper.toDomain(data);
  }

  static normalizeRelation(relation) {
    if (!relation) return null;
    if (Array.isArray(relation)) return relation;
    if (relation.data) return Array.isArray(relation.data) ? relation.data : [relation.data];
    return relation;
  }

  static toDomainList(strapiDataList) {
    // Handle Strapi v5 response with data wrapper
    if (strapiDataList && strapiDataList.data !== undefined) {
      if (Array.isArray(strapiDataList.data)) {
        return strapiDataList.data.map(item => ExamResultMapper.toDomain(item));
      } else if (strapiDataList.data) {
        return [ExamResultMapper.toDomain(strapiDataList.data)];
      }
      return [];
    }

    if (!strapiDataList) return [];
    if (!Array.isArray(strapiDataList)) return [ExamResultMapper.toDomain(strapiDataList)];
    return strapiDataList.map(item => ExamResultMapper.toDomain(item));
  }
}