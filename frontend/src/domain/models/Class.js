export class Class {
  constructor(data = {}) {
    this.id = data.id || null;
    this.documentId = data.documentId || null;
    this.className = data.class_name || data.className || data.classname || '';
    this.classCode = data.class_code || data.classCode || '';
    this.description = data.description || '';
    this.isActive = data.is_active !== undefined ? data.is_active : (data.isActive !== undefined ? data.isActive : true);
    this.capacity = data.capacity || 0;
    this.divisions = data.divisions || [];
    this.enrollments = data.enrollments || [];
    this.feeAssignments = data.fee_assignments || data.feeAssignments || [];
    this.examResults = data.exam_results || data.examResults || [];
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  get studentCount() {
    return this.enrollments.filter(e => e.isActive).length;
  }

  get availableSeats() {
    return this.capacity - this.studentCount;
  }

  get occupancyRate() {
    if (this.capacity === 0) return 0;
    return (this.studentCount / this.capacity) * 100;
  }

  get divisionCount() {
    return this.divisions.length;
  }

  isFull() {
    return this.studentCount >= this.capacity;
  }

  hasCapacity() {
    return this.availableSeats > 0;
  }

  toJSON() {
    return {
      id: this.id,
      documentId: this.documentId,
      className: this.className,
      classCode: this.classCode,
      description: this.description,
      isActive: this.isActive,
      capacity: this.capacity,
      divisions: this.divisions,
      enrollments: this.enrollments,
      feeAssignments: this.feeAssignments,
      examResults: this.examResults,
      studentCount: this.studentCount,
      availableSeats: this.availableSeats,
      occupancyRate: this.occupancyRate,
      divisionCount: this.divisionCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Static factory method for API responses
  static fromApiResponse(data) {
    if (!data) return null;

    if (Array.isArray(data)) {
      return data.map(item => new Class(item));
    }

    return new Class(data);
  }

  // Convert to API format for submission
  toApiFormat() {
    return {
      class_name: this.className,
      class_code: this.classCode,
      description: this.description,
      is_active: this.isActive,
      capacity: this.capacity
    };
  }
}