import { Location } from '../../domain/models/Location';

export class LocationMapper {
  static toDomain(strapiData) {
    if (!strapiData) return null;

    if (Array.isArray(strapiData)) {
      return strapiData.map(item => LocationMapper.toDomain(item));
    }

    const data = strapiData.attributes || strapiData;

    return new Location({
      id: strapiData.id,
      documentId: strapiData.documentId || data.documentId,
      name: data.name,
      type: data.type,
      parentLocation: LocationMapper.mapParentLocation(data.parent_location || data.parentLocation),
      fullAddress: data.full_address || data.fullAddress,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postal_code || data.postalCode,
      coordinates: LocationMapper.mapCoordinates(data),
      isActive: data.is_active !== undefined ? data.is_active : data.isActive,
      busStops: LocationMapper.mapBusStops(data.bus_stops || data.busStops),
      students: LocationMapper.mapStudents(data.students),
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at
    });
  }

  static toAPI(domainModel) {
    if (!domainModel) return null;

    return {
      name: domainModel.name,
      type: domainModel.type,
      parent_location: domainModel.parentLocation?.id || domainModel.parentLocation,
      full_address: domainModel.fullAddress,
      city: domainModel.city,
      state: domainModel.state,
      country: domainModel.country,
      postal_code: domainModel.postalCode,
      latitude: domainModel.coordinates?.lat,
      longitude: domainModel.coordinates?.lng,
      is_active: domainModel.isActive
    };
  }

  static mapParentLocation(parentLocation) {
    if (!parentLocation) return null;
    const normalized = LocationMapper.normalizeRelation(parentLocation);
    const data = Array.isArray(normalized) ? normalized[0] : normalized;

    if (!data) return null;

    return {
      id: data.id,
      documentId: data.documentId,
      name: data.name,
      type: data.type
    };
  }

  static mapCoordinates(data) {
    const coords = {
      lat: null,
      lng: null
    };

    if (data.coordinates) {
      coords.lat = data.coordinates.lat || null;
      coords.lng = data.coordinates.lng || null;
    } else {
      coords.lat = data.latitude || null;
      coords.lng = data.longitude || null;
    }

    return coords;
  }

  static mapBusStops(busStops) {
    if (!busStops) return [];
    const normalized = LocationMapper.normalizeRelation(busStops);
    if (!Array.isArray(normalized)) return [];

    return normalized.map(stop => ({
      id: stop.id,
      documentId: stop.documentId,
      stopName: stop.stop_name || stop.stopName,
      stopCode: stop.stop_code || stop.stopCode
    }));
  }

  static mapStudents(students) {
    if (!students) return [];
    const normalized = LocationMapper.normalizeRelation(students);
    if (!Array.isArray(normalized)) return [];

    return normalized.map(student => ({
      id: student.id,
      documentId: student.documentId,
      firstName: student.first_name || student.firstName,
      lastName: student.last_name || student.lastName
    }));
  }

  static normalizeRelation(relation) {
    if (!relation) return null;
    if (Array.isArray(relation)) return relation;
    if (relation.data) return Array.isArray(relation.data) ? relation.data : [relation.data];
    return relation;
  }

  static toDomainList(strapiDataArray) {
    // Handle Strapi v5 response format { data: [...], meta: {...} }
    let dataArray = strapiDataArray;
    if (strapiDataArray && strapiDataArray.data && Array.isArray(strapiDataArray.data)) {
      dataArray = strapiDataArray.data;
    }

    if (!dataArray || !Array.isArray(dataArray)) {
      return [];
    }

    return dataArray.map(item => LocationMapper.toDomain(item));
  }

  static toStrapi(domainModel) {
    return LocationMapper.toAPI(domainModel);
  }
}