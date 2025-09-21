export class EnrollmentAdministration {
  constructor(data = {}) {
    this.id = data.id || null;
    this.documentId = data.documentId || null;
    this.enrollment = data.enrollment || null;
    this.division = data.division || null;
    this.dateOfAdmission = data.dateOfAdmission || null;
    this.seatAllocations = data.seatAllocations || [];
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  get divisionName() {
    return this.division?.divisionName || this.division?.name || '';
  }

  get enrollmentNumber() {
    return this.enrollment?.enrollmentNumber || this.enrollment?.enrollment_number || '';
  }

  get hasSeatAllocations() {
    return this.seatAllocations && this.seatAllocations.length > 0;
  }

  get currentSeatAllocation() {
    if (!this.seatAllocations || this.seatAllocations.length === 0) return null;
    // Return the most recent active seat allocation
    return this.seatAllocations.find(s => s.status === 'active') ||
           this.seatAllocations[this.seatAllocations.length - 1];
  }

  toJSON() {
    return {
      id: this.id,
      documentId: this.documentId,
      enrollment: this.enrollment,
      division: this.division,
      dateOfAdmission: this.dateOfAdmission,
      seatAllocations: this.seatAllocations,
      divisionName: this.divisionName,
      enrollmentNumber: this.enrollmentNumber,
      hasSeatAllocations: this.hasSeatAllocations,
      currentSeatAllocation: this.currentSeatAllocation,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}