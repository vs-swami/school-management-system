export class Transaction {
  constructor(data = {}) {
    this.id = data.id || null;
    this.documentId = data.documentId || null;
    this.transactionNumber = data.transactionNumber || '';
    this.transactionType = data.transactionType || 'income';
    this.transactionCategory = data.transactionCategory || '';
    this.amount = parseFloat(data.amount || 0);
    this.currency = data.currency || 'INR';
    this.paymentMethod = data.paymentMethod || '';
    this.transactionDate = data.transactionDate || null;
    this.referenceNumber = data.referenceNumber || '';
    this.bankReference = data.bankReference || '';
    this.status = data.status || 'pending';
    this.paymentItems = data.paymentItems || [];
    this.expensePayment = data.expensePayment || null;
    this.walletTransaction = data.walletTransaction || null;
    this.payerName = data.payerName || '';
    this.payerContact = data.payerContact || '';
    this.receiptNumber = data.receiptNumber || '';
    this.processedBy = data.processedBy || null;
    this.notes = data.notes || '';
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  static TYPES = {
    INCOME: 'income',
    EXPENSE: 'expense',
    TRANSFER: 'transfer',
    REFUND: 'refund'
  };

  static CATEGORIES = {
    STUDENT_FEE: 'student_fee',
    TRANSPORT_FEE: 'transport_fee',
    LAB_FEE: 'lab_fee',
    EXAM_FEE: 'exam_fee',
    WALLET_TOPUP: 'wallet_topup',
    WALLET_DEDUCTION: 'wallet_deduction',
    MAINTENANCE: 'maintenance',
    SALARY: 'salary',
    UTILITIES: 'utilities',
    SUPPLIES: 'supplies',
    OTHER: 'other'
  };

  static PAYMENT_METHODS = {
    CASH: 'cash',
    CHEQUE: 'cheque',
    BANK_TRANSFER: 'bank_transfer',
    UPI: 'upi',
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    WALLET: 'wallet',
    ONLINE: 'online'
  };

  static STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  };

  get isIncome() {
    return this.transactionType === 'income';
  }

  get isExpense() {
    return this.transactionType === 'expense';
  }

  get isStudentPayment() {
    return ['student_fee', 'transport_fee', 'lab_fee', 'exam_fee'].includes(this.transactionCategory);
  }

  get isWalletTransaction() {
    return ['wallet_topup', 'wallet_deduction'].includes(this.transactionCategory);
  }

  getTypeLabel() {
    const labels = {
      income: 'Income',
      expense: 'Expense',
      transfer: 'Transfer',
      refund: 'Refund'
    };
    return labels[this.transactionType] || this.transactionType;
  }

  getCategoryLabel() {
    const labels = {
      student_fee: 'Student Fee',
      transport_fee: 'Transport Fee',
      lab_fee: 'Lab Fee',
      exam_fee: 'Exam Fee',
      wallet_topup: 'Wallet Top-up',
      wallet_deduction: 'Wallet Purchase',
      maintenance: 'Maintenance',
      salary: 'Salary',
      utilities: 'Utilities',
      supplies: 'Supplies',
      other: 'Other'
    };
    return labels[this.transactionCategory] || this.transactionCategory;
  }

  getPaymentMethodLabel() {
    const labels = {
      cash: 'Cash',
      cheque: 'Cheque',
      bank_transfer: 'Bank Transfer',
      upi: 'UPI',
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      wallet: 'Wallet',
      online: 'Online'
    };
    return labels[this.paymentMethod] || this.paymentMethod;
  }

  getStatusLabel() {
    const labels = {
      pending: 'Pending',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled',
      refunded: 'Refunded'
    };
    return labels[this.status] || this.status;
  }

  getStatusColor() {
    const colors = {
      pending: 'yellow',
      completed: 'green',
      failed: 'red',
      cancelled: 'gray',
      refunded: 'purple'
    };
    return colors[this.status] || 'gray';
  }

  formatTransactionDate() {
    if (!this.transactionDate) return '';
    const date = new Date(this.transactionDate);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatAmount() {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: this.currency
    }).format(this.amount);
  }

  toJSON() {
    return {
      id: this.id,
      documentId: this.documentId,
      transactionNumber: this.transactionNumber,
      transactionType: this.transactionType,
      transactionCategory: this.transactionCategory,
      amount: this.amount,
      currency: this.currency,
      paymentMethod: this.paymentMethod,
      transactionDate: this.transactionDate,
      referenceNumber: this.referenceNumber,
      bankReference: this.bankReference,
      status: this.status,
      paymentItems: this.paymentItems,
      expensePayment: this.expensePayment,
      walletTransaction: this.walletTransaction,
      payerName: this.payerName,
      payerContact: this.payerContact,
      receiptNumber: this.receiptNumber,
      processedBy: this.processedBy,
      notes: this.notes,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(json) {
    return new Transaction({
      id: json.id,
      documentId: json.documentId,
      transactionNumber: json.transactionNumber,
      transactionType: json.transactionType,
      transactionCategory: json.transactionCategory,
      amount: parseFloat(json.amount || 0),
      currency: json.currency,
      paymentMethod: json.paymentMethod,
      transactionDate: json.transactionDate,
      referenceNumber: json.referenceNumber,
      bankReference: json.bankReference,
      status: json.status,
      paymentItems: json.paymentItems,
      expensePayment: json.expensePayment,
      walletTransaction: json.walletTransaction,
      payerName: json.payerName,
      payerContact: json.payerContact,
      receiptNumber: json.receiptNumber,
      processedBy: json.processedBy,
      notes: json.notes,
      metadata: json.metadata,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt
    });
  }
}