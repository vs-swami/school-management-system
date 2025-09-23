import { PaymentSchedule } from '../../domain/models';
import { PaymentItemMapper } from './PaymentItemMapper';

export class PaymentScheduleMapper {
  static toDomainList(strapiDataArray) {
    if (strapiDataArray && strapiDataArray.data !== undefined) {
      if (Array.isArray(strapiDataArray.data)) {
        return strapiDataArray.data.map(item => PaymentScheduleMapper.toDomain(item));
      }
      return [];
    }
    if (!strapiDataArray || !Array.isArray(strapiDataArray)) return [];
    return strapiDataArray.map(item => PaymentScheduleMapper.toDomain(item));
  }

  static toDomain(strapiData) {
    if (!strapiData) return null;

    if (Array.isArray(strapiData)) {
      return strapiData.map(item => PaymentScheduleMapper.toDomain(item));
    }

    // Handle both wrapper formats
    const data = strapiData.data || strapiData.attributes || strapiData;

    // Map payment items if they exist
    let mappedPaymentItems = [];
    if (data.payment_items) {
      mappedPaymentItems = PaymentScheduleMapper.normalizeRelationArray(data.payment_items)
        .map(item => PaymentItemMapper.toDomain(item));
    }

    // Map enrollment relation
    let mappedEnrollment = null;
    if (data.enrollment) {
      mappedEnrollment = PaymentScheduleMapper.normalizeRelation(data.enrollment);
    }

    return new PaymentSchedule({
      id: strapiData.id || data.id,
      documentId: strapiData.documentId || data.documentId,
      scheduleNumber: data.schedule_number,
      enrollment: mappedEnrollment,
      totalAmount: parseFloat(data.total_amount || 0),
      paidAmount: parseFloat(data.paid_amount || 0),
      status: data.status,
      paymentItems: mappedPaymentItems,
      generatedAt: data.generated_at,
      activatedAt: data.activated_at,
      notes: data.notes,
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at
    });
  }

  static normalizeRelation(relation) {
    if (!relation) return null;

    // Handle Strapi v5 relation format
    if (relation.data) {
      return relation.data;
    }

    // Direct relation object
    return relation;
  }

  static normalizeRelationArray(relation) {
    if (!relation) return [];

    // Handle Strapi v5 relation format
    if (relation.data) {
      return Array.isArray(relation.data) ? relation.data : [relation.data];
    }

    // Already an array
    if (Array.isArray(relation)) {
      return relation;
    }

    // Single item
    return [relation];
  }

  static toStrapi(domainData) {
    if (!domainData) return null;

    const strapiData = {
      schedule_number: domainData.scheduleNumber,
      enrollment: domainData.enrollment?.id || domainData.enrollment,
      total_amount: domainData.totalAmount,
      paid_amount: domainData.paidAmount,
      status: domainData.status,
      notes: domainData.notes
    };

    // Remove undefined values
    Object.keys(strapiData).forEach(key =>
      strapiData[key] === undefined && delete strapiData[key]
    );

    return strapiData;
  }

  static summaryToDomain(summaryData) {
    if (!summaryData || !summaryData.data) return null;

    const { schedule, stats } = summaryData.data;

    return {
      schedule: PaymentScheduleMapper.toDomain(schedule),
      stats: {
        totalItems: stats.totalItems || 0,
        paidItems: stats.paidItems || 0,
        pendingItems: stats.pendingItems || 0,
        overdueItems: stats.overdueItems || 0,
        totalAmount: parseFloat(stats.totalAmount || 0),
        paidAmount: parseFloat(stats.paidAmount || 0),
        pendingAmount: parseFloat(stats.pendingAmount || 0)
      }
    };
  }
}