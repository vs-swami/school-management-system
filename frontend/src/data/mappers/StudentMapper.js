import { Student } from '../../domain/models/Student';
import { Guardian } from '../../domain/models/Guardian';
import { Enrollment } from '../../domain/models/Enrollment';
import { ExamResult } from '../../domain/models/ExamResult';
import { ClassMapper } from './ClassMapper';
import { DivisionMapper } from './DivisionMapper';
import { AcademicYearMapper } from './AcademicYearMapper';
import { ExamResultMapper } from './ExamResultMapper';
import { GuardianMapper } from './GuardianMapper';
import { EnrollmentMapper } from './EnrollmentMapper';

export class StudentMapper {
  static toDomainList(strapiDataArray) {
    // Handle Strapi v5 response format { data: [...], meta: {...} }
    let dataArray = strapiDataArray;
    if (strapiDataArray && strapiDataArray.data && Array.isArray(strapiDataArray.data)) {
      dataArray = strapiDataArray.data;
    }

    if (!dataArray || !Array.isArray(dataArray)) {
      return [];
    }

    return dataArray.map(item => StudentMapper.toDomain(item));
  }

  static toDomain(strapiData) {
    if (!strapiData) return null;

    // Handle Strapi v5 response with data wrapper
    if (strapiData.data !== undefined) {
      if (Array.isArray(strapiData.data)) {
        return strapiData.data.map(item => StudentMapper.toDomain(item));
      } else if (strapiData.data) {
        return StudentMapper.toDomain(strapiData.data);
      }
      return null;
    }

    if (Array.isArray(strapiData)) {
      return StudentMapper.toDomainList(strapiData);
    }

    // Handle Strapi 5 response structure
    const data = strapiData.attributes || strapiData;

    const domainModel = new Student({
      id: strapiData.id,
      documentId: strapiData.documentId || data.documentId,
      // Name fields (using exact schema field names)
      gr_full_name: data.gr_full_name,
      aadhaar_full_name: data.aadhaar_full_name,
      legal_name_source: data.legal_name_source,
      first_name: data.first_name || '',
      middle_name: data.middle_name || '',
      last_name: data.last_name || '',
      // Basic info
      gender: data.gender,
      dob: data.dob,
      // ID fields (using exact schema field names)
      aadhaar_no: data.aadhaar_no,
      ssa_uid: data.ssa_uid,
      apaar_id: data.apaar_id,
      // Relations
      place: StudentMapper.normalizeRelation(data.place)?.[0] || null,
      caste: StudentMapper.normalizeRelation(data.caste)?.[0] || null,
      house: StudentMapper.normalizeRelation(data.house)?.[0] || null,
      village: StudentMapper.normalizeRelation(data.village)?.[0] || null,
      guardians: StudentMapper.mapGuardians(data.guardians),
      // Enrollments: one-to-one in schema but handled as array for consistency
      enrollments: data.enrollments ? [StudentMapper.mapEnrollment(data.enrollments)] : [],
      documents: StudentMapper.mapDocuments(data.documents),
      exam_results: StudentMapper.mapExamResults(data.exam_results),
      // Component fields
      addresses: StudentMapper.mapAddresses(data.addresses),
      contacts: StudentMapper.mapContacts(data.contacts)
    });

    return domainModel;
  }

  static toStrapi(domainModel) {
    console.log('Mapping domain model to Strapi format:', domainModel);
    if (!domainModel) return null;

    // Use domain model fields (which are already in snake_case)
    const firstName = domainModel.first_name || '';
    const middleName = domainModel.middle_name || '';
    const lastName = domainModel.last_name || '';

    // Generate gr_full_name if not provided
    let grFullName = domainModel.gr_full_name;
    if (!grFullName && (firstName || lastName)) {
      grFullName = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim();
    }

    const data = {
      // Name fields
      gr_full_name: grFullName,
      aadhaar_full_name: domainModel.aadhaar_full_name,
      legal_name_source: domainModel.legal_name_source || 'gr',
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      // Basic info
      gender: domainModel.gender,
      dob: domainModel.dob,
      // ID fields
      aadhaar_no: domainModel.aadhaar_no,
      ssa_uid: domainModel.ssa_uid,
      apaar_id: domainModel.apaar_id,
      // Component fields
      addresses: domainModel.addresses,
      contacts: domainModel.contacts
    };

    // Remove undefined/null fields to avoid sending empty values (but keep empty strings for optional fields)
    Object.keys(data).forEach(key => {
      if (data[key] === undefined || data[key] === null) {
        delete data[key];
      }
      // Only remove empty strings for non-required fields
      if (data[key] === '' && !['first_name', 'last_name', 'gr_full_name', 'gender', 'dob'].includes(key)) {
        delete data[key];
      }
    });

    // Add relation IDs
    if (domainModel.place) {
      data.place = domainModel.place.id || domainModel.place;
    }
    if (domainModel.caste) {
      data.caste = domainModel.caste.id || domainModel.caste;
    }
    if (domainModel.house) {
      data.house = domainModel.house.id || domainModel.house;
    }
    if (domainModel.village) {
      data.village = domainModel.village.id || domainModel.village;
    }

    // Only include guardian IDs if they exist, otherwise omit the field
    if (domainModel.guardians && domainModel.guardians.length > 0) {
      const guardianIds = domainModel.guardians
        .map(g => g.id || g)
        .filter(id => id);
      if (guardianIds.length > 0) {
        data.guardians = guardianIds;
      }
    }

    // Handle enrollments - keep as array for backend processing
    if (domainModel.enrollments) {
      // Ensure enrollments is always an array
      if (Array.isArray(domainModel.enrollments)) {
        data.enrollments = domainModel.enrollments;
      } else {
        data.enrollments = [domainModel.enrollments];
      }
    }

    // Only include document IDs if they exist
    if (domainModel.documents && domainModel.documents.length > 0) {
      const documentIds = domainModel.documents
        .map(d => d.id || d)
        .filter(id => id);
      if (documentIds.length > 0) {
        data.documents = documentIds;
      }
    }

    // Only include exam result IDs if they exist
    if (domainModel.exam_results && domainModel.exam_results.length > 0) {
      const examResultIds = domainModel.exam_results
        .map(e => e.id || e)
        .filter(id => id);
      if (examResultIds.length > 0) {
        data.exam_results = examResultIds;
      }
    }

    return { data };
  }

  static toAPI(domainModel) {
    // Alias for backward compatibility
    return StudentMapper.toStrapi(domainModel);
  }

  static mapAddresses(addresses) {
    if (!addresses) return [];
    return addresses.map(addr => ({
      type: addr.type,
      addressLine1: addr.address_line_1 || addr.addressLine1,
      addressLine2: addr.address_line_2 || addr.addressLine2,
      city: addr.city,
      state: addr.state,
      country: addr.country,
      postalCode: addr.postal_code || addr.postalCode,
      isPrimary: addr.is_primary || addr.isPrimary
    }));
  }

  static mapContacts(contacts) {
    if (!contacts) return [];
    return contacts.map(contact => ({
      type: contact.type,
      value: contact.value,
      isPrimary: contact.is_primary || contact.isPrimary,
      isEmergency: contact.is_emergency || contact.isEmergency
    }));
  }

  static mapGuardians(guardians) {
    if (!guardians) return [];
    const normalizedGuardians = StudentMapper.normalizeRelation(guardians);
    if (!Array.isArray(normalizedGuardians)) return [];

    return normalizedGuardians.map(guardian => GuardianMapper.toDomain(guardian));
  }

  static mapDocuments(documents) {
    if (!documents) return [];
    const normalizedDocs = StudentMapper.normalizeRelation(documents);
    if (!Array.isArray(normalizedDocs)) return [];

    return normalizedDocs.map(doc => ({
      id: doc.id,
      documentId: doc.documentId,
      documentType: doc.document_type || doc.documentType,
      documentNumber: doc.document_number || doc.documentNumber,
      fileName: doc.file_name || doc.fileName,
      uploadDate: doc.upload_date || doc.uploadDate
    }));
  }

  static mapEnrollment(enrollment) {
    if (!enrollment) return null;

    // Handle both array and single object formats from API
    let enrollmentData = enrollment;

    // If it's wrapped in data property (Strapi v5 format)
    if (enrollment.data !== undefined) {
      enrollmentData = enrollment.data;
    }

    // If it's an array, take the first item
    if (Array.isArray(enrollmentData)) {
      enrollmentData = enrollmentData[0];
    }

    if (!enrollmentData) return null;

    return EnrollmentMapper.toDomain(enrollmentData);
  }

  // Keep the old method for backward compatibility
  static mapEnrollments(enrollments) {
    if (!enrollments) return [];
    const normalizedEnrollments = StudentMapper.normalizeRelation(enrollments);
    if (!Array.isArray(normalizedEnrollments)) return [];

    return normalizedEnrollments.map(enrollment => EnrollmentMapper.toDomain(enrollment));
  }

  static mapExamResults(examResults) {
    if (!examResults) return [];
    const normalizedResults = StudentMapper.normalizeRelation(examResults);
    if (!Array.isArray(normalizedResults)) return [];

    return normalizedResults.map(result => ExamResultMapper.toDomain(result));
  }

  static mapClass(classData) {
    if (!classData) return null;
    const normalized = Array.isArray(classData) ? classData[0] : classData;
    if (!normalized) return null;

    return ClassMapper.toDomain(normalized);
  }

  static mapDivision(divisionData) {
    if (!divisionData) return null;
    const normalized = Array.isArray(divisionData) ? divisionData[0] : divisionData;
    if (!normalized) return null;

    return DivisionMapper.toDomain(normalized);
  }

  static mapAcademicYear(yearData) {
    if (!yearData) return null;
    const normalized = Array.isArray(yearData) ? yearData[0] : yearData;
    if (!normalized) return null;

    return AcademicYearMapper.toDomain(normalized);
  }

  static normalizeRelation(relation) {
    if (!relation) return [];
    if (Array.isArray(relation)) return relation;
    if (relation.data) return Array.isArray(relation.data) ? relation.data : [relation.data];
    return [relation];
  }
}