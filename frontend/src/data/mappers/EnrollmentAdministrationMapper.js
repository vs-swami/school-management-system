import { EnrollmentAdministration } from '../../domain/models/EnrollmentAdministration';
import { DivisionMapper } from './DivisionMapper';

export class EnrollmentAdministrationMapper {
  static toDomain(strapiData) {
    if (!strapiData) return null;

    // Handle Strapi v5 response with data wrapper
    if (strapiData.data !== undefined) {
      if (Array.isArray(strapiData.data)) {
        return strapiData.data.map(item => EnrollmentAdministrationMapper.toDomain(item));
      } else if (strapiData.data) {
        return EnrollmentAdministrationMapper.toDomain(strapiData.data);
      }
      return null;
    }

    if (Array.isArray(strapiData)) {
      return strapiData.map(item => EnrollmentAdministrationMapper.toDomain(item));
    }

    // Handle Strapi 5 response structure
    const data = strapiData.attributes || strapiData;

    return new EnrollmentAdministration({
      id: strapiData.id,
      documentId: strapiData.documentId || data.documentId,
      enrollment: EnrollmentAdministrationMapper.mapEnrollment(data.enrollment),
      division: DivisionMapper.toDomain(data.division),
      dateOfAdmission: data.date_of_admission,
      seatAllocations: EnrollmentAdministrationMapper.mapSeatAllocations(data.seat_allocations),
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at
    });
  }

  static toStrapi(domainModel) {
    if (!domainModel) return null;

    const data = {
      date_of_admission: domainModel.dateOfAdmission
    };

    // Add relations if present
    if (domainModel.enrollment) {
      data.enrollment = domainModel.enrollment.id || domainModel.enrollment;
    }
    if (domainModel.division) {
      data.division = domainModel.division.id || domainModel.division;
    }
    if (domainModel.seatAllocations && domainModel.seatAllocations.length > 0) {
      data.seat_allocations = domainModel.seatAllocations.map(s => s.id || s);
    }

    // Remove undefined fields
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    return data;
  }

  static toAPI(domainModel) {
    return EnrollmentAdministrationMapper.toStrapi(domainModel);
  }

  static mapEnrollment(enrollment) {
    if (!enrollment) return null;
    const normalized = EnrollmentAdministrationMapper.normalizeRelation(enrollment);
    const data = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!data) return null;

    // Return basic enrollment info to avoid circular dependency
    return {
      id: data.id,
      documentId: data.documentId,
      enrollmentNumber: data.enrollment_number || data.enrollmentNumber,
      rollNumber: data.roll_number || data.rollNumber
    };
  }

  static mapSeatAllocations(seatAllocations) {
    if (!seatAllocations) return [];
    const normalized = EnrollmentAdministrationMapper.normalizeRelation(seatAllocations);
    if (!Array.isArray(normalized)) return [];

    return normalized.map(allocation => ({
      id: allocation.id,
      documentId: allocation.documentId,
      bus: allocation.bus,
      pickupStop: allocation.pickup_stop || allocation.pickupStop,
      allocationDate: allocation.allocation_date || allocation.allocationDate,
      validFrom: allocation.valid_from || allocation.validFrom,
      validUntil: allocation.valid_until || allocation.validUntil,
      isActive: allocation.is_active !== undefined ? allocation.is_active : allocation.isActive,
      allocationType: allocation.allocation_type || allocation.allocationType || 'regular',
      monthlyFee: allocation.monthly_fee || allocation.monthlyFee,
      notes: allocation.notes
    }));
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
        return strapiDataList.data.map(item => EnrollmentAdministrationMapper.toDomain(item));
      } else if (strapiDataList.data) {
        return [EnrollmentAdministrationMapper.toDomain(strapiDataList.data)];
      }
      return [];
    }

    if (!strapiDataList) return [];
    if (!Array.isArray(strapiDataList)) return [EnrollmentAdministrationMapper.toDomain(strapiDataList)];
    return strapiDataList.map(item => EnrollmentAdministrationMapper.toDomain(item));
  }
}