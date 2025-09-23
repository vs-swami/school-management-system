import { PaymentItem } from '../../domain/models';

export class PaymentItemMapper {
  static toDomainList(strapiDataArray) {
    if (strapiDataArray && strapiDataArray.data !== undefined) {
      if (Array.isArray(strapiDataArray.data)) {
        return strapiDataArray.data.map(item => PaymentItemMapper.toDomain(item));
      }
      return [];
    }
    if (!strapiDataArray || !Array.isArray(strapiDataArray)) return [];
    return strapiDataArray.map(item => PaymentItemMapper.toDomain(item));
  }

  static toDomain(strapiData) {
    if (!strapiData) return null;

    if (Array.isArray(strapiData)) {
      return strapiData.map(item => PaymentItemMapper.toDomain(item));
    }

    // Handle both wrapper formats
    const data = strapiData.attributes || strapiData;

    // Map relations
    let mappedPaymentSchedule = null;
    if (data.payment_schedule) {
      mappedPaymentSchedule = PaymentItemMapper.normalizeRelation(data.payment_schedule);
    }

    let mappedFeeDefinition = null;
    if (data.fee_definition) {
      mappedFeeDefinition = PaymentItemMapper.normalizeRelation(data.fee_definition);
    }

    let mappedTransactions = [];
    if (data.transactions) {
      mappedTransactions = PaymentItemMapper.normalizeRelationArray(data.transactions);
    }

    return new PaymentItem({
      id: strapiData.id || data.id,
      documentId: strapiData.documentId || data.documentId,
      paymentSchedule: mappedPaymentSchedule,
      feeDefinition: mappedFeeDefinition,
      description: data.description,
      amount: parseFloat(data.amount || 0),
      discountAmount: parseFloat(data.discount_amount || 0),
      netAmount: parseFloat(data.net_amount || 0),
      dueDate: data.due_date,
      installmentNumber: data.installment_number,
      status: data.status,
      paidAmount: parseFloat(data.paid_amount || 0),
      transactions: mappedTransactions,
      lateFeeApplied: parseFloat(data.late_fee_applied || 0),
      waiverReason: data.waiver_reason,
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
      payment_schedule: domainData.paymentSchedule?.id || domainData.paymentSchedule,
      fee_definition: domainData.feeDefinition?.id || domainData.feeDefinition,
      description: domainData.description,
      amount: domainData.amount,
      discount_amount: domainData.discountAmount,
      net_amount: domainData.netAmount,
      due_date: domainData.dueDate,
      installment_number: domainData.installmentNumber,
      status: domainData.status,
      paid_amount: domainData.paidAmount,
      late_fee_applied: domainData.lateFeeApplied,
      waiver_reason: domainData.waiverReason,
      notes: domainData.notes
    };

    // Remove undefined values
    Object.keys(strapiData).forEach(key =>
      strapiData[key] === undefined && delete strapiData[key]
    );

    return strapiData;
  }
}