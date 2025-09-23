import { StudentWalletRepository } from '../repositories/StudentWalletRepository';
import { StudentWalletMapper } from '../mappers/StudentWalletMapper';

export class StudentWalletRepositoryAdapter {
  constructor() {
    this.repository = StudentWalletRepository;
  }

  async findByStudent(studentId) {
    const data = await this.repository.findByStudent(studentId);
    return StudentWalletMapper.toDomain(data?.data);
  }

  async topup(walletId, topupData) {
    const result = await this.repository.topup(walletId, topupData);
    return {
      transaction: result?.data?.transaction,
      walletTransaction: result?.data?.walletTransaction,
      newBalance: result?.data?.newBalance
    };
  }

  async purchase(walletId, purchaseData) {
    const result = await this.repository.purchase(walletId, purchaseData);
    return {
      transaction: result?.data?.transaction,
      walletTransaction: result?.data?.walletTransaction,
      newBalance: result?.data?.newBalance
    };
  }

  async getTransactions(walletId, filters = {}) {
    const data = await this.repository.getTransactions(walletId, filters);
    return data?.data || [];
  }

  async getStatement(walletId, startDate, endDate) {
    const data = await this.repository.getStatement(walletId, startDate, endDate);
    return StudentWalletMapper.statementToDomain(data);
  }

  async checkBalance(walletId) {
    const data = await this.repository.checkBalance(walletId);
    return StudentWalletMapper.balanceToDomain(data);
  }

  async getAllActive() {
    const data = await this.repository.getAllActive();
    return StudentWalletMapper.activeSummaryToDomain(data);
  }

  async bulkTopup(wallets) {
    const result = await this.repository.bulkTopup(wallets);
    return result?.data;
  }

  async findAll(filters = {}) {
    const data = await this.repository.findAll(filters);
    return StudentWalletMapper.toDomainList(data);
  }

  async findById(id) {
    const data = await this.repository.findById(id);
    return StudentWalletMapper.toDomain(data);
  }

  async create(walletData) {
    const apiData = StudentWalletMapper.toStrapi(walletData);
    const result = await this.repository.create(apiData);
    return StudentWalletMapper.toDomain(result);
  }

  async update(id, walletData) {
    const apiData = StudentWalletMapper.toStrapi(walletData);
    const result = await this.repository.update(id, apiData);
    return StudentWalletMapper.toDomain(result);
  }
}