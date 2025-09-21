export class BusRoute {
  constructor(data = {}) {
    this.id = data.id || null;
    this.documentId = data.documentId || null;
    this.routeName = data.routeName || '';
    this.routeCode = data.routeCode || '';
    this.description = data.description || '';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.busStops = data.busStops || [];
    this.stopSchedules = data.stopSchedules || [];
    this.bus = data.bus || null;
    this.buses = data.buses || [];
    this.startTime = data.startTime || null;
    this.endTime = data.endTime || null;
    this.distance = data.distance || null;
    this.estimatedDuration = data.estimatedDuration || null;
    this.monthlyFee = data.monthlyFee || 0;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  get stopCount() {
    return this.busStops.length;
  }

  get busCount() {
    return this.buses.length;
  }

  get firstStop() {
    return this.busStops[0] || null;
  }

  get lastStop() {
    return this.busStops[this.busStops.length - 1] || null;
  }

  hasStop(stopId) {
    return this.busStops.some(stop =>
      stop.id === stopId || stop === stopId
    );
  }

  hasBus(busId) {
    return this.buses.some(bus =>
      bus.id === busId || bus === busId
    );
  }

  getStopOrder(stopId) {
    const index = this.busStops.findIndex(stop =>
      stop.id === stopId || stop === stopId
    );
    return index !== -1 ? index + 1 : null;
  }

  toJSON() {
    return {
      id: this.id,
      documentId: this.documentId,
      routeName: this.routeName,
      routeCode: this.routeCode,
      description: this.description,
      isActive: this.isActive,
      busStops: this.busStops,
      buses: this.buses,
      startTime: this.startTime,
      endTime: this.endTime,
      distance: this.distance,
      estimatedDuration: this.estimatedDuration,
      monthlyFee: this.monthlyFee,
      stopCount: this.stopCount,
      busCount: this.busCount,
      firstStop: this.firstStop,
      lastStop: this.lastStop,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}