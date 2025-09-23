export class PaymentSchedule {
  constructor(data = {}) {
    this.id = data.id || null;
    this.documentId = data.documentId || null;
    this.scheduleNumber = data.scheduleNumber || '';
    this.enrollment = data.enrollment || null;
    this.totalAmount = parseFloat(data.totalAmount || 0);
    this.paidAmount = parseFloat(data.paidAmount || 0);
    this.status = data.status || 'draft';
    this.paymentItems = data.paymentItems || [];
    this.generatedAt = data.generatedAt || null;
    this.activatedAt = data.activatedAt || null;
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  static STATUS = {
    DRAFT: 'draft',
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  };

  get pendingAmount() {
    return this.totalAmount - this.paidAmount;
  }

  get progressPercentage() {
    if (this.totalAmount === 0) return 0;
    return Math.round((this.paidAmount / this.totalAmount) * 100);
  }

  get studentName() {
    return this.enrollment?.student?.first_name
      ? `${this.enrollment.student.first_name} ${this.enrollment.student.last_name || ''}`
      : '';
  }

  get className() {
    return this.enrollment?.class?.classname || '';
  }

  get academicYear() {
    return this.enrollment?.academic_year?.year || '';
  }

  get overdueItems() {
    if (!this.paymentItems || this.paymentItems.length === 0) return [];
    const today = new Date();
    return this.paymentItems.filter(item =>
      item.status === 'pending' &&
      new Date(item.due_date) < today
    );
  }

  get nextDueItem() {
    if (!this.paymentItems || this.paymentItems.length === 0) return null;
    const pendingItems = this.paymentItems.filter(item => item.status === 'pending');
    if (pendingItems.length === 0) return null;

    return pendingItems.reduce((earliest, item) => {
      if (!earliest) return item;
      return new Date(item.due_date) < new Date(earliest.due_date) ? item : earliest;
    }, null);
  }

  isOverdue() {
    return this.overdueItems.length > 0;
  }

  isFullyPaid() {
    return this.paidAmount >= this.totalAmount;
  }

  getStatusLabel() {
    const labels = {
      draft: 'Draft',
      active: 'Active',
      suspended: 'Suspended',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return labels[this.status] || this.status;
  }

  getStatusColor() {
    const colors = {
      draft: 'gray',
      active: 'blue',
      suspended: 'yellow',
      completed: 'green',
      cancelled: 'red'
    };
    return colors[this.status] || 'gray';
  }

  toJSON() {
    return {
      id: this.id,
      documentId: this.documentId,
      scheduleNumber: this.scheduleNumber,
      enrollment: this.enrollment,
      totalAmount: this.totalAmount,
      paidAmount: this.paidAmount,
      status: this.status,
      paymentItems: this.paymentItems,
      generatedAt: this.generatedAt,
      activatedAt: this.activatedAt,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(json) {
    return new PaymentSchedule({
      id: json.id,
      documentId: json.documentId,
      scheduleNumber: json.scheduleNumber,
      enrollment: json.enrollment,
      totalAmount: parseFloat(json.totalAmount || 0),
      paidAmount: parseFloat(json.paidAmount || 0),
      status: json.status,
      paymentItems: json.paymentItems,
      generatedAt: json.generatedAt,
      activatedAt: json.activatedAt,
      notes: json.notes,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt
    });
  }
}