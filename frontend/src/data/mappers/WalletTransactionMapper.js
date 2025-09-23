import { WalletTransaction } from '../../domain/models';

export class WalletTransactionMapper {
  static toDomainList(strapiDataArray) {
    if (strapiDataArray && strapiDataArray.data !== undefined) {
      if (Array.isArray(strapiDataArray.data)) {
        return strapiDataArray.data.map(item => WalletTransactionMapper.toDomain(item));
      }
      return [];
    }
    if (!strapiDataArray || !Array.isArray(strapiDataArray)) return [];
    return strapiDataArray.map(item => WalletTransactionMapper.toDomain(item));
  }

  static toDomain(strapiData) {
    if (!strapiData) return null;

    if (Array.isArray(strapiData)) {
      return strapiData.map(item => WalletTransactionMapper.toDomain(item));
    }

    // Handle both wrapper formats
    const data = strapiData.attributes || strapiData;

    // Map relations
    let mappedWallet = null;
    if (data.wallet) {
      mappedWallet = WalletTransactionMapper.normalizeRelation(data.wallet);
    }

    let mappedTransaction = null;
    if (data.transaction) {
      mappedTransaction = WalletTransactionMapper.normalizeRelation(data.transaction);
    }

    let mappedPerformedBy = null;
    if (data.performed_by) {
      mappedPerformedBy = WalletTransactionMapper.normalizeRelation(data.performed_by);
    }

    return new WalletTransaction({
      id: strapiData.id || data.id,
      documentId: strapiData.documentId || data.documentId,
      wallet: mappedWallet,
      transactionType: data.transaction_type,
      amount: parseFloat(data.amount || 0),
      balanceBefore: parseFloat(data.balance_before || 0),
      balanceAfter: parseFloat(data.balance_after || 0),
      description: data.description,
      category: data.category,
      transaction: mappedTransaction,
      itemDetails: data.item_details || {},
      transactionDate: data.transaction_date,
      performedBy: mappedPerformedBy,
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

  static toStrapi(domainData) {
    if (!domainData) return null;

    const strapiData = {
      wallet: domainData.wallet?.id || domainData.wallet,
      transaction_type: domainData.transactionType,
      amount: domainData.amount,
      balance_before: domainData.balanceBefore,
      balance_after: domainData.balanceAfter,
      description: domainData.description,
      category: domainData.category,
      transaction: domainData.transaction?.id || domainData.transaction,
      item_details: domainData.itemDetails,
      transaction_date: domainData.transactionDate,
      performed_by: domainData.performedBy?.id || domainData.performedBy,
      notes: domainData.notes
    };

    // Remove undefined values
    Object.keys(strapiData).forEach(key =>
      strapiData[key] === undefined && delete strapiData[key]
    );

    return strapiData;
  }
}