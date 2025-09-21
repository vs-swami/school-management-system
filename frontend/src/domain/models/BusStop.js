export class BusStop {
  constructor(data = {}) {
    this.id = data.id || null;
    this.documentId = data.documentId || null;
    this.stopName = data.stopName || '';
    this.stopCode = data.stopCode || '';
    this.location = data.location || null;
    this.coordinates = data.coordinates || { lat: null, lng: null };
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.notes = data.notes || '';
    this.routes = data.routes || [];
    this.students = data.students || [];
    this.pickupTime = data.pickupTime || null;
    this.dropTime = data.dropTime || null;
    this.monthlyFee = data.monthlyFee || 0;
    this.distanceFromSchool = data.distanceFromSchool || null;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  get studentCount() {
    return this.students.length;
  }

  get routeCount() {
    return this.routes.length;
  }

  hasCoordinates() {
    return this.coordinates &&
           this.coordinates.lat !== null &&
           this.coordinates.lng !== null;
  }

  hasLocation() {
    return this.location !== null;
  }

  isOnRoute(routeId) {
    return this.routes.some(route =>
      route.id === routeId || route === routeId
    );
  }

  toJSON() {
    return {
      id: this.id,
      documentId: this.documentId,
      stopName: this.stopName,
      stopCode: this.stopCode,
      location: this.location,
      coordinates: this.coordinates,
      isActive: this.isActive,
      notes: this.notes,
      routes: this.routes,
      students: this.students,
      studentCount: this.studentCount,
      routeCount: this.routeCount,
      pickupTime: this.pickupTime,
      dropTime: this.dropTime,
      monthlyFee: this.monthlyFee,
      distanceFromSchool: this.distanceFromSchool,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}