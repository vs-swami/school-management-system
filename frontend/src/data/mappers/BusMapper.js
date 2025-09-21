import { Bus } from '../../domain/models/Bus';

export class BusMapper {
  static toDomain(strapiData) {
    if (!strapiData) return null;

    return new Bus({
      id: strapiData.id,
      busNumber: strapiData.bus_number,
      capacity: strapiData.capacity,
      totalSeats: strapiData.total_seats,
      driverName: strapiData.driver_name,
      driverPhone: strapiData.driver_phone,
      status: strapiData.status,
      currentRoute: strapiData.current_route,
      fuelLevel: strapiData.fuel_level,
      nextMaintenance: strapiData.next_maintenance,
      registrationNumber: strapiData.registration_number,
      insuranceExpiry: strapiData.insurance_expiry,
      createdAt: strapiData.createdAt,
      updatedAt: strapiData.updatedAt
    });
  }

  static toStrapi(domainModel) {
    if (!domainModel) return null;

    return {
      bus_number: domainModel.busNumber,
      capacity: domainModel.capacity,
      total_seats: domainModel.totalSeats,
      driver_name: domainModel.driverName,
      driver_phone: domainModel.driverPhone,
      status: domainModel.status,
      current_route: domainModel.currentRoute,
      fuel_level: domainModel.fuelLevel,
      next_maintenance: domainModel.nextMaintenance,
      registration_number: domainModel.registrationNumber,
      insurance_expiry: domainModel.insuranceExpiry
    };
  }

  static toDomainList(strapiDataList) {
    // Handle Strapi v5 response with data wrapper
    if (strapiDataList && strapiDataList.data !== undefined) {
      if (Array.isArray(strapiDataList.data)) {
        return strapiDataList.data.map(data => this.toDomain(data));
      }
      return [];
    }

    if (!Array.isArray(strapiDataList)) return [];
    return strapiDataList.map(data => this.toDomain(data));
  }
}