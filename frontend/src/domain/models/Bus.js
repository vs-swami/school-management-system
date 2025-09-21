export class Bus {
  constructor(data = {}) {
    this.id = data.id || '';
    this.documentId = data.documentId || null;
    this.busNumber = data.bus_number || data.busNumber || '';
    this.capacity = data.capacity || 0;
    this.totalSeats = data.total_seats || data.totalSeats || 0;
    this.driverName = data.driver_name || data.driverName || '';
    this.driverPhone = data.driver_phone || data.driverPhone || '';
    this.status = data.status || 'inactive';
    this.currentRoute = data.current_route || data.currentRoute || null;
    this.fuelLevel = data.fuel_level || data.fuelLevel || 0;
    this.nextMaintenance = data.next_maintenance || data.nextMaintenance || null;
    this.registrationNumber = data.registration_number || data.registrationNumber || '';
    this.insuranceExpiry = data.insurance_expiry || data.insuranceExpiry || null;
    this.busRoutes = this.normalizeRelation(data.bus_routes || data.busRoutes);
    this.seatAllocations = this.normalizeRelation(data.seat_allocations || data.seatAllocations);
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  // Helper to normalize relations
  normalizeRelation(relation) {
    if (!relation) return [];
    if (Array.isArray(relation)) return relation;
    if (relation.data) return relation.data;
    return [];
  }

  // Computed properties
  get displayName() {
    return this.busNumber || `Bus ${this.id}`;
  }

  get availableSeats() {
    // Calculate based on current seat allocations
    const allocatedSeats = this.seatAllocations?.length || 0;
    return this.totalSeats - allocatedSeats;
  }

  get isActive() {
    return this.status === 'active';
  }

  get isOnRoute() {
    return this.currentRoute !== null;
  }

  get maintenanceDue() {
    if (!this.nextMaintenance) return false;
    const maintenanceDate = new Date(this.nextMaintenance);
    const today = new Date();
    const daysUntil = Math.ceil((maintenanceDate - today) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7; // Due if within 7 days
  }

  get insuranceDue() {
    if (!this.insuranceExpiry) return false;
    const expiryDate = new Date(this.insuranceExpiry);
    const today = new Date();
    const daysUntil = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30; // Due if within 30 days
  }

  // Methods
  canAccommodate(numberOfStudents) {
    return this.availableSeats >= numberOfStudents;
  }

  isAvailableForRoute() {
    return this.isActive && !this.isOnRoute;
  }

  // Convert to JSON for serialization
  toJSON() {
    return {
      id: this.id,
      documentId: this.documentId,
      busNumber: this.busNumber,
      capacity: this.capacity,
      totalSeats: this.totalSeats,
      driverName: this.driverName,
      driverPhone: this.driverPhone,
      status: this.status,
      currentRoute: this.currentRoute,
      fuelLevel: this.fuelLevel,
      nextMaintenance: this.nextMaintenance,
      registrationNumber: this.registrationNumber,
      insuranceExpiry: this.insuranceExpiry,
      busRoutes: this.busRoutes,
      seatAllocations: this.seatAllocations,
      availableSeats: this.availableSeats,
      isActive: this.isActive,
      isOnRoute: this.isOnRoute,
      maintenanceDue: this.maintenanceDue,
      insuranceDue: this.insuranceDue,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Static factory method for API responses
  static fromApiResponse(data) {
    if (!data) return null;

    if (Array.isArray(data)) {
      return data.map(item => new Bus(item));
    }

    return new Bus(data);
  }

  // Convert to API format for submission
  toApiFormat() {
    return {
      bus_number: this.busNumber,
      capacity: this.capacity,
      total_seats: this.totalSeats,
      driver_name: this.driverName,
      driver_phone: this.driverPhone,
      status: this.status,
      current_route: this.currentRoute,
      fuel_level: this.fuelLevel,
      next_maintenance: this.nextMaintenance,
      registration_number: this.registrationNumber,
      insurance_expiry: this.insuranceExpiry
    };
  }
}