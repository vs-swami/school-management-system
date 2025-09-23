export class StudentWallet {
  constructor(data = {}) {
    this.id = data.id || null;
    this.documentId = data.documentId || null;
    this.student = data.student || null;
    this.walletId = data.walletId || '';
    this.currentBalance = parseFloat(data.currentBalance || 0);
    this.totalDeposits = parseFloat(data.totalDeposits || 0);
    this.totalWithdrawals = parseFloat(data.totalWithdrawals || 0);
    this.status = data.status || 'active';
    this.dailySpendingLimit = parseFloat(data.dailySpendingLimit || 0);
    this.lowBalanceThreshold = parseFloat(data.lowBalanceThreshold || 100);
    this.walletTransactions = data.walletTransactions || [];
    this.lastActivity = data.lastActivity || null;
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  static STATUS = {
    ACTIVE: 'active',
    FROZEN: 'frozen',
    CLOSED: 'closed'
  };

  get studentName() {
    return this.student?.first_name
      ? `${this.student.first_name} ${this.student.last_name || ''}`
      : '';
  }

  get studentGrNumber() {
    return this.student?.enrollments?.[0]?.gr_no || '';
  }

  get studentClass() {
    return this.student?.enrollments?.[0]?.class?.classname || '';
  }

  get isLowBalance() {
    return this.currentBalance < this.lowBalanceThreshold;
  }

  get hasSpendingLimit() {
    return this.dailySpendingLimit > 0;
  }

  get lifetimeSpending() {
    return this.totalWithdrawals;
  }

  get lifetimeDeposits() {
    return this.totalDeposits;
  }

  canMakePurchase(amount) {
    if (this.status !== 'active') return false;
    if (this.currentBalance < amount) return false;
    return true;
  }

  getTodaySpending() {
    if (!this.walletTransactions || this.walletTransactions.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.walletTransactions
      .filter(txn => {
        const txnDate = new Date(txn.transaction_date);
        txnDate.setHours(0, 0, 0, 0);
        return txnDate.getTime() === today.getTime() &&
          ['purchase', 'withdrawal'].includes(txn.transaction_type);
      })
      .reduce((sum, txn) => sum + parseFloat(txn.amount || 0), 0);
  }

  getRecentTransactions(limit = 5) {
    if (!this.walletTransactions || this.walletTransactions.length === 0) return [];

    return [...this.walletTransactions]
      .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
      .slice(0, limit);
  }

  getStatusLabel() {
    const labels = {
      active: 'Active',
      frozen: 'Frozen',
      closed: 'Closed'
    };
    return labels[this.status] || this.status;
  }

  getStatusColor() {
    const colors = {
      active: 'green',
      frozen: 'yellow',
      closed: 'red'
    };
    return colors[this.status] || 'gray';
  }

  formatBalance() {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(this.currentBalance);
  }

  formatLastActivity() {
    if (!this.lastActivity) return 'Never';
    const date = new Date(this.lastActivity);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toJSON() {
    return {
      id: this.id,
      documentId: this.documentId,
      student: this.student,
      walletId: this.walletId,
      currentBalance: this.currentBalance,
      totalDeposits: this.totalDeposits,
      totalWithdrawals: this.totalWithdrawals,
      status: this.status,
      dailySpendingLimit: this.dailySpendingLimit,
      lowBalanceThreshold: this.lowBalanceThreshold,
      walletTransactions: this.walletTransactions,
      lastActivity: this.lastActivity,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(json) {
    return new StudentWallet({
      id: json.id,
      documentId: json.documentId,
      student: json.student,
      walletId: json.walletId,
      currentBalance: parseFloat(json.currentBalance || 0),
      totalDeposits: parseFloat(json.totalDeposits || 0),
      totalWithdrawals: parseFloat(json.totalWithdrawals || 0),
      status: json.status,
      dailySpendingLimit: parseFloat(json.dailySpendingLimit || 0),
      lowBalanceThreshold: parseFloat(json.lowBalanceThreshold || 100),
      walletTransactions: json.walletTransactions,
      lastActivity: json.lastActivity,
      notes: json.notes,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt
    });
  }
}