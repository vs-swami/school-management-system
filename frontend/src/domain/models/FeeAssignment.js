export class FeeAssignment {
  constructor(data = {}) {
    this.id = data.id || null;
    this.documentId = data.documentId || null;
    this.feeDefinition = data.feeDefinition || null;
    this.class = data.class || null;
    this.academicYear = data.academicYear || null;
    this.amount = data.amount || 0;
    this.dueDate = data.dueDate || null;
    this.isRecurring = data.isRecurring || false;
    this.frequency = data.frequency || 'monthly';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.description = data.description || '';
    this.appliedToStudents = data.appliedToStudents || [];
    this.exemptions = data.exemptions || [];
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  get feeType() {
    return this.feeDefinition?.feeType || '';
  }

  get feeName() {
    return this.feeDefinition?.name || '';
  }

  get className() {
    return this.class?.className || '';
  }

  get studentCount() {
    return this.appliedToStudents.length;
  }

  get exemptionCount() {
    return this.exemptions.length;
  }

  get totalExpectedAmount() {
    return this.amount * (this.studentCount - this.exemptionCount);
  }

  isDue() {
    if (!this.dueDate) return false;
    return new Date(this.dueDate) <= new Date();
  }

  isOverdue() {
    if (!this.dueDate) return false;
    return new Date(this.dueDate) < new Date();
  }

  hasExemptions() {
    return this.exemptions.length > 0;
  }

  toJSON() {
    return {
      id: this.id,
      documentId: this.documentId,
      feeDefinition: this.feeDefinition,
      class: this.class,
      academicYear: this.academicYear,
      amount: this.amount,
      dueDate: this.dueDate,
      isRecurring: this.isRecurring,
      frequency: this.frequency,
      isActive: this.isActive,
      description: this.description,
      appliedToStudents: this.appliedToStudents,
      exemptions: this.exemptions,
      feeType: this.feeType,
      feeName: this.feeName,
      className: this.className,
      studentCount: this.studentCount,
      exemptionCount: this.exemptionCount,
      totalExpectedAmount: this.totalExpectedAmount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}