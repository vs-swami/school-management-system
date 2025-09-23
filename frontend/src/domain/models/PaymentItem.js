export class PaymentItem {
  constructor(data = {}) {
    this.id = data.id || null;
    this.documentId = data.documentId || null;
    this.paymentSchedule = data.paymentSchedule || null;
    this.feeDefinition = data.feeDefinition || null;
    this.description = data.description || '';
    this.amount = parseFloat(data.amount || 0);
    this.discountAmount = parseFloat(data.discountAmount || 0);
    this.netAmount = parseFloat(data.netAmount || 0);
    this.dueDate = data.dueDate || null;
    this.installmentNumber = data.installmentNumber || null;
    this.status = data.status || 'pending';
    this.paidAmount = parseFloat(data.paidAmount || 0);
    this.transactions = data.transactions || [];
    this.lateFeeApplied = parseFloat(data.lateFeeApplied || 0);
    this.waiverReason = data.waiverReason || '';
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  static STATUS = {
    PENDING: 'pending',
    PARTIALLY_PAID: 'partially_paid',
    PAID: 'paid',
    OVERDUE: 'overdue',
    WAIVED: 'waived',
    CANCELLED: 'cancelled'
  };

  get pendingAmount() {
    return this.netAmount - this.paidAmount;
  }

  get isOverdue() {
    if (this.status === 'paid' || this.status === 'waived') return false;
    return new Date(this.dueDate) < new Date();
  }

  get daysOverdue() {
    if (!this.isOverdue) return 0;
    const today = new Date();
    const due = new Date(this.dueDate);
    const diffTime = Math.abs(today - due);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get feeType() {
    return this.feeDefinition?.name || '';
  }

  get paymentProgress() {
    if (this.netAmount === 0) return 100;
    return Math.round((this.paidAmount / this.netAmount) * 100);
  }

  isFullyPaid() {
    return this.paidAmount >= this.netAmount;
  }

  canPay() {
    return this.status !== 'paid' && this.status !== 'waived' && this.status !== 'cancelled';
  }

  getStatusLabel() {
    const labels = {
      pending: 'Pending',
      partially_paid: 'Partially Paid',
      paid: 'Paid',
      overdue: 'Overdue',
      waived: 'Waived',
      cancelled: 'Cancelled'
    };
    return labels[this.status] || this.status;
  }

  getStatusColor() {
    const colors = {
      pending: 'yellow',
      partially_paid: 'orange',
      paid: 'green',
      overdue: 'red',
      waived: 'gray',
      cancelled: 'gray'
    };
    return colors[this.status] || 'gray';
  }

  formatDueDate() {
    if (!this.dueDate) return '';
    const date = new Date(this.dueDate);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  toJSON() {
    return {
      id: this.id,
      documentId: this.documentId,
      paymentSchedule: this.paymentSchedule,
      feeDefinition: this.feeDefinition,
      description: this.description,
      amount: this.amount,
      discountAmount: this.discountAmount,
      netAmount: this.netAmount,
      dueDate: this.dueDate,
      installmentNumber: this.installmentNumber,
      status: this.status,
      paidAmount: this.paidAmount,
      transactions: this.transactions,
      lateFeeApplied: this.lateFeeApplied,
      waiverReason: this.waiverReason,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(json) {
    return new PaymentItem({
      id: json.id,
      documentId: json.documentId,
      paymentSchedule: json.paymentSchedule,
      feeDefinition: json.feeDefinition,
      description: json.description,
      amount: parseFloat(json.amount || 0),
      discountAmount: parseFloat(json.discountAmount || 0),
      netAmount: parseFloat(json.netAmount || 0),
      dueDate: json.dueDate,
      installmentNumber: json.installmentNumber,
      status: json.status,
      paidAmount: parseFloat(json.paidAmount || 0),
      transactions: json.transactions,
      lateFeeApplied: parseFloat(json.lateFeeApplied || 0),
      waiverReason: json.waiverReason,
      notes: json.notes,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt
    });
  }
}