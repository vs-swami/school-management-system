import { Transaction } from '../../domain/models';
import { PaymentItemMapper } from './PaymentItemMapper';

export class TransactionMapper {
  static toDomainList(strapiDataArray) {
    if (strapiDataArray && strapiDataArray.data !== undefined) {
      if (Array.isArray(strapiDataArray.data)) {
        return strapiDataArray.data.map(item => TransactionMapper.toDomain(item));
      }
      return [];
    }
    if (!strapiDataArray || !Array.isArray(strapiDataArray)) return [];
    return strapiDataArray.map(item => TransactionMapper.toDomain(item));
  }

  static toDomain(strapiData) {
    if (!strapiData) return null;

    if (Array.isArray(strapiData)) {
      return strapiData.map(item => TransactionMapper.toDomain(item));
    }

    // Handle both wrapper formats
    const data = strapiData.attributes || strapiData;

    // Map relations - properly map payment items
    let mappedPaymentItems = [];
    if (data.payment_items) {
      const normalizedItems = TransactionMapper.normalizeRelationArray(data.payment_items);
      mappedPaymentItems = normalizedItems.map(item => PaymentItemMapper.toDomain(item));
    }

    let mappedExpensePayment = null;
    if (data.expense_payment) {
      mappedExpensePayment = TransactionMapper.normalizeRelation(data.expense_payment);
    }

    let mappedWalletTransaction = null;
    if (data.wallet_transaction) {
      mappedWalletTransaction = TransactionMapper.normalizeRelation(data.wallet_transaction);
    }

    let mappedProcessedBy = null;
    if (data.processed_by) {
      mappedProcessedBy = TransactionMapper.normalizeRelation(data.processed_by);
    }

    return new Transaction({
      id: strapiData.id || data.id,
      documentId: strapiData.documentId || data.documentId,
      transactionNumber: data.transaction_number,
      transactionType: data.transaction_type,
      transactionCategory: data.transaction_category,
      amount: parseFloat(data.amount || 0),
      currency: data.currency || 'INR',
      paymentMethod: data.payment_method,
      transactionDate: data.transaction_date,
      referenceNumber: data.reference_number,
      bankReference: data.bank_reference,
      status: data.status,
      paymentItems: mappedPaymentItems,
      expensePayment: mappedExpensePayment,
      walletTransaction: mappedWalletTransaction,
      payerName: data.payer_name,
      payerContact: data.payer_contact,
      receiptNumber: data.receipt_number,
      processedBy: mappedProcessedBy,
      notes: data.notes,
      metadata: data.metadata || {},
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
      transaction_number: domainData.transactionNumber,
      transaction_type: domainData.transactionType,
      transaction_category: domainData.transactionCategory,
      amount: domainData.amount,
      currency: domainData.currency,
      payment_method: domainData.paymentMethod,
      transaction_date: domainData.transactionDate,
      reference_number: domainData.referenceNumber,
      bank_reference: domainData.bankReference,
      status: domainData.status,
      payer_name: domainData.payerName,
      payer_contact: domainData.payerContact,
      receipt_number: domainData.receiptNumber,
      notes: domainData.notes,
      metadata: domainData.metadata
    };

    // Handle relations
    if (domainData.paymentItems) {
      strapiData.payment_items = domainData.paymentItems.map(item => item.id || item);
    }

    if (domainData.processedBy) {
      strapiData.processed_by = domainData.processedBy.id || domainData.processedBy;
    }

    // Remove undefined values
    Object.keys(strapiData).forEach(key =>
      strapiData[key] === undefined && delete strapiData[key]
    );

    return strapiData;
  }

  static receiptToDomain(receiptData) {
    if (!receiptData || !receiptData.data) return null;

    const data = receiptData.data;

    return {
      receiptNumber: data.receiptNumber,
      transactionNumber: data.transactionNumber,
      date: data.date,
      student: data.student,
      class: data.class,
      academicYear: data.academicYear,
      paymentMethod: data.paymentMethod,
      amount: parseFloat(data.amount || 0),
      payerName: data.payerName,
      payerContact: data.payerContact,
      items: data.items || []
    };
  }

  static dailyCollectionToDomain(collectionData) {
    if (!collectionData || !collectionData.data) return null;

    const data = collectionData.data;

    return {
      date: data.date,
      totalCollection: parseFloat(data.totalCollection || 0),
      transactionCount: data.transactionCount || 0,
      byPaymentMethod: data.byPaymentMethod || {},
      byCategory: data.byCategory || {},
      transactions: TransactionMapper.toDomainList({ data: data.transactions })
    };
  }
}