export class Location {
  constructor(data = {}) {
    this.id = data.id || null;
    this.documentId = data.documentId || null;
    this.name = data.name || '';
    this.type = data.type || '';
    this.parentLocation = data.parentLocation || null;
    this.fullAddress = data.fullAddress || '';
    this.city = data.city || '';
    this.state = data.state || '';
    this.country = data.country || '';
    this.postalCode = data.postalCode || '';
    this.coordinates = data.coordinates || { lat: null, lng: null };
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.busStops = data.busStops || [];
    this.students = data.students || [];
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  get busStopCount() {
    return this.busStops.length;
  }

  get studentCount() {
    return this.students.length;
  }

  get parentLocationName() {
    return this.parentLocation?.name || '';
  }

  hasCoordinates() {
    return this.coordinates &&
           this.coordinates.lat !== null &&
           this.coordinates.lng !== null;
  }

  hasParent() {
    return this.parentLocation !== null;
  }

  getFullPath() {
    const parts = [this.name];
    if (this.parentLocation) {
      parts.unshift(this.parentLocationName);
    }
    if (this.city) parts.push(this.city);
    if (this.state) parts.push(this.state);
    if (this.country) parts.push(this.country);
    return parts.join(', ');
  }

  toJSON() {
    return {
      id: this.id,
      documentId: this.documentId,
      name: this.name,
      type: this.type,
      parentLocation: this.parentLocation,
      parentLocationName: this.parentLocationName,
      fullAddress: this.fullAddress,
      city: this.city,
      state: this.state,
      country: this.country,
      postalCode: this.postalCode,
      coordinates: this.coordinates,
      isActive: this.isActive,
      busStops: this.busStops,
      students: this.students,
      busStopCount: this.busStopCount,
      studentCount: this.studentCount,
      fullPath: this.getFullPath(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}