import { TransactionRepository } from '../repositories/TransactionRepository';
import { TransactionMapper } from '../mappers/TransactionMapper';

export class TransactionRepositoryAdapter {
  constructor() {
    this.repository = TransactionRepository;
  }

  async processFeePayment(paymentData) {
    const result = await this.repository.processFeePayment(paymentData);
    return TransactionMapper.toDomain(result?.data);
  }

  async getDailyCollection(date) {
    const data = await this.repository.getDailyCollection(date);
    return TransactionMapper.dailyCollectionToDomain(data);
  }

  async findByStudent(studentId) {
    const data = await this.repository.findByStudent(studentId);
    return TransactionMapper.toDomainList(data);
  }

  async getReceipt(transactionId) {
    const data = await this.repository.getReceipt(transactionId);
    return TransactionMapper.receiptToDomain(data);
  }

  async findAll(filters = {}) {
    const data = await this.repository.findAll(filters);
    return TransactionMapper.toDomainList(data);
  }

  async findById(id) {
    const data = await this.repository.findById(id);
    return TransactionMapper.toDomain(data);
  }

  async create(transactionData) {
    const apiData = TransactionMapper.toStrapi(transactionData);
    const result = await this.repository.create(apiData);
    return TransactionMapper.toDomain(result);
  }

  async update(id, transactionData) {
    const apiData = TransactionMapper.toStrapi(transactionData);
    const result = await this.repository.update(id, apiData);
    return TransactionMapper.toDomain(result);
  }

  async getStudentFinanceTransactions(filters = {}) {
    const data = await this.repository.getStudentFinanceTransactions(filters);
    return TransactionMapper.toDomainList(data);
  }

  async processBatchPayment(paymentData) {
    const result = await this.repository.processBatchPayment(paymentData);
    return result?.data;
  }
}