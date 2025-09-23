import { StudentWallet } from '../../domain/models';
import { WalletTransactionMapper } from './WalletTransactionMapper';

export class StudentWalletMapper {
  static toDomainList(strapiDataArray) {
    if (strapiDataArray && strapiDataArray.data !== undefined) {
      if (Array.isArray(strapiDataArray.data)) {
        return strapiDataArray.data.map(item => StudentWalletMapper.toDomain(item));
      }
      return [];
    }
    if (!strapiDataArray || !Array.isArray(strapiDataArray)) return [];
    return strapiDataArray.map(item => StudentWalletMapper.toDomain(item));
  }

  static toDomain(strapiData) {
    if (!strapiData) return null;

    if (Array.isArray(strapiData)) {
      return strapiData.map(item => StudentWalletMapper.toDomain(item));
    }

    // Handle both wrapper formats
    const data = strapiData.data || strapiData.attributes || strapiData;

    // Map relations
    let mappedStudent = null;
    if (data.student) {
      mappedStudent = StudentWalletMapper.normalizeRelation(data.student);
    }

    let mappedWalletTransactions = [];
    if (data.wallet_transactions) {
      const transactions = StudentWalletMapper.normalizeRelationArray(data.wallet_transactions);
      mappedWalletTransactions = transactions.map(txn => WalletTransactionMapper.toDomain(txn));
    }

    return new StudentWallet({
      id: strapiData.id || data.id,
      documentId: strapiData.documentId || data.documentId,
      student: mappedStudent,
      walletId: data.wallet_id,
      currentBalance: parseFloat(data.current_balance || 0),
      totalDeposits: parseFloat(data.total_deposits || 0),
      totalWithdrawals: parseFloat(data.total_withdrawals || 0),
      status: data.status,
      dailySpendingLimit: parseFloat(data.daily_spending_limit || 0),
      lowBalanceThreshold: parseFloat(data.low_balance_threshold || 100),
      walletTransactions: mappedWalletTransactions,
      lastActivity: data.last_activity,
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
      student: domainData.student?.id || domainData.student,
      wallet_id: domainData.walletId,
      current_balance: domainData.currentBalance,
      total_deposits: domainData.totalDeposits,
      total_withdrawals: domainData.totalWithdrawals,
      status: domainData.status,
      daily_spending_limit: domainData.dailySpendingLimit,
      low_balance_threshold: domainData.lowBalanceThreshold,
      last_activity: domainData.lastActivity,
      notes: domainData.notes
    };

    // Remove undefined values
    Object.keys(strapiData).forEach(key =>
      strapiData[key] === undefined && delete strapiData[key]
    );

    return strapiData;
  }

  static balanceToDomain(balanceData) {
    if (!balanceData || !balanceData.data) return null;

    const data = balanceData.data;

    return {
      walletId: data.walletId,
      student: data.student,
      currentBalance: parseFloat(data.currentBalance || 0),
      status: data.status,
      lowBalanceThreshold: parseFloat(data.lowBalanceThreshold || 100),
      isLowBalance: data.isLowBalance || false,
      lastActivity: data.lastActivity
    };
  }

  static statementToDomain(statementData) {
    if (!statementData || !statementData.data) return null;

    const data = statementData.data;

    return {
      wallet: StudentWalletMapper.toDomain(data.wallet),
      period: data.period,
      openingBalance: parseFloat(data.openingBalance || 0),
      closingBalance: parseFloat(data.closingBalance || 0),
      transactions: data.transactions?.map(txn => WalletTransactionMapper.toDomain(txn)) || [],
      summary: {
        totalDeposits: parseFloat(data.summary?.totalDeposits || 0),
        totalWithdrawals: parseFloat(data.summary?.totalWithdrawals || 0),
        totalPurchases: parseFloat(data.summary?.totalPurchases || 0),
        transactionCount: data.summary?.transactionCount || 0
      }
    };
  }

  static activeSummaryToDomain(summaryData) {
    if (!summaryData || !summaryData.data) return null;

    const data = summaryData.data;

    return {
      totalWallets: data.totalWallets || 0,
      totalBalance: parseFloat(data.totalBalance || 0),
      wallets: StudentWalletMapper.toDomainList({ data: data.wallets })
    };
  }
}