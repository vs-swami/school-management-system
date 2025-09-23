export class WalletTransaction {
  constructor(data = {}) {
    this.id = data.id || null;
    this.documentId = data.documentId || null;
    this.wallet = data.wallet || null;
    this.transactionType = data.transactionType || '';
    this.amount = parseFloat(data.amount || 0);
    this.balanceBefore = parseFloat(data.balanceBefore || 0);
    this.balanceAfter = parseFloat(data.balanceAfter || 0);
    this.description = data.description || '';
    this.category = data.category || '';
    this.transaction = data.transaction || null;
    this.itemDetails = data.itemDetails || {};
    this.transactionDate = data.transactionDate || null;
    this.performedBy = data.performedBy || null;
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  static TYPES = {
    DEPOSIT: 'deposit',
    WITHDRAWAL: 'withdrawal',
    PURCHASE: 'purchase',
    REFUND: 'refund'
  };

  static CATEGORIES = {
    CANTEEN: 'canteen',
    STATIONERY: 'stationery',
    UNIFORM: 'uniform',
    BOOKS: 'books',
    FIELD_TRIP: 'field_trip',
    EVENT: 'event',
    SPORTS: 'sports',
    LIBRARY: 'library',
    TOPUP: 'topup',
    OTHER: 'other'
  };

  get isDebit() {
    return ['withdrawal', 'purchase'].includes(this.transactionType);
  }

  get isCredit() {
    return ['deposit', 'refund'].includes(this.transactionType);
  }

  get balanceChange() {
    return this.balanceAfter - this.balanceBefore;
  }

  getTypeLabel() {
    const labels = {
      deposit: 'Deposit',
      withdrawal: 'Withdrawal',
      purchase: 'Purchase',
      refund: 'Refund'
    };
    return labels[this.transactionType] || this.transactionType;
  }

  getCategoryLabel() {
    const labels = {
      canteen: 'Canteen',
      stationery: 'Stationery',
      uniform: 'Uniform',
      books: 'Books',
      field_trip: 'Field Trip',
      event: 'Event',
      sports: 'Sports',
      library: 'Library',
      topup: 'Top-up',
      other: 'Other'
    };
    return labels[this.category] || this.category;
  }

  getTypeIcon() {
    const icons = {
      deposit: '↓',
      withdrawal: '↑',
      purchase: '🛒',
      refund: '↩️'
    };
    return icons[this.transactionType] || '•';
  }

  getTypeColor() {
    if (this.isCredit) return 'green';
    if (this.isDebit) return 'red';
    return 'gray';
  }

  formatAmount() {
    const prefix = this.isCredit ? '+' : '-';
    return `${prefix} ${new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(this.amount)}`;
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

  formatBalances() {
    const format = (value) => new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);

    return {
      before: format(this.balanceBefore),
      after: format(this.balanceAfter),
      change: this.formatAmount()
    };
  }

  toJSON() {
    return {
      id: this.id,
      documentId: this.documentId,
      wallet: this.wallet,
      transactionType: this.transactionType,
      amount: this.amount,
      balanceBefore: this.balanceBefore,
      balanceAfter: this.balanceAfter,
      description: this.description,
      category: this.category,
      transaction: this.transaction,
      itemDetails: this.itemDetails,
      transactionDate: this.transactionDate,
      performedBy: this.performedBy,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(json) {
    return new WalletTransaction({
      id: json.id,
      documentId: json.documentId,
      wallet: json.wallet,
      transactionType: json.transactionType,
      amount: parseFloat(json.amount || 0),
      balanceBefore: parseFloat(json.balanceBefore || 0),
      balanceAfter: parseFloat(json.balanceAfter || 0),
      description: json.description,
      category: json.category,
      transaction: json.transaction,
      itemDetails: json.itemDetails,
      transactionDate: json.transactionDate,
      performedBy: json.performedBy,
      notes: json.notes,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt
    });
  }
}