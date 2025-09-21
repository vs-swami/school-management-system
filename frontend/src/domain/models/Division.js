export class Division {
  constructor(data = {}) {
    this.id = data.id || null;
    this.documentId = data.documentId || null;
    this.divisionName = data.divisionName || '';
    this.divisionCode = data.divisionCode || '';
    this.class = data.class || null;
    this.teacher = data.teacher || null;
    this.capacity = data.capacity || 0;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.students = data.students || [];
    this.schedule = data.schedule || [];
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  get studentCount() {
    return this.students.length;
  }

  get availableSeats() {
    return this.capacity - this.studentCount;
  }

  get occupancyRate() {
    if (this.capacity === 0) return 0;
    return (this.studentCount / this.capacity) * 100;
  }

  isFull() {
    return this.studentCount >= this.capacity;
  }

  hasCapacity() {
    return this.availableSeats > 0;
  }

  hasTeacher() {
    return this.teacher !== null;
  }

  toJSON() {
    return {
      id: this.id,
      documentId: this.documentId,
      divisionName: this.divisionName,
      divisionCode: this.divisionCode,
      class: this.class,
      teacher: this.teacher,
      capacity: this.capacity,
      isActive: this.isActive,
      students: this.students,
      schedule: this.schedule,
      studentCount: this.studentCount,
      availableSeats: this.availableSeats,
      occupancyRate: this.occupancyRate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}