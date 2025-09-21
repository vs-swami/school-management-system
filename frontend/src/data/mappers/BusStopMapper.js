import { BusStop } from '../../domain/models/BusStop';
import { LocationMapper } from './LocationMapper';
import { BusRouteMapper } from './BusRouteMapper';

export class BusStopMapper {
  static toDomain(strapiData) {
    if (!strapiData) return null;

    // Handle Strapi v5 response with data wrapper
    if (strapiData.data !== undefined) {
      if (Array.isArray(strapiData.data)) {
        return strapiData.data.map(item => BusStopMapper.toDomain(item));
      } else if (strapiData.data) {
        return BusStopMapper.toDomain(strapiData.data);
      }
      return null;
    }

    if (Array.isArray(strapiData)) {
      return strapiData.map(item => BusStopMapper.toDomain(item));
    }

    // Handle Strapi 5 response structure
    const data = strapiData.attributes || strapiData;

    return new BusStop({
      id: strapiData.id,
      documentId: strapiData.documentId || data.documentId,
      stopName: data.stop_name || data.stopName,
      stopCode: data.stop_code || data.stopCode,
      location: BusStopMapper.mapLocation(data.location),
      coordinates: BusStopMapper.mapCoordinates(data.coordinates || data),
      isActive: data.is_active !== undefined ? data.is_active : data.isActive,
      notes: data.notes,
      routes: BusStopMapper.mapRoutes(data.routes || data.bus_routes),
      students: BusStopMapper.mapStudents(data.students),
      pickupTime: data.pickup_time || data.pickupTime,
      dropTime: data.drop_time || data.dropTime,
      monthlyFee: data.monthly_fee || data.monthlyFee || 0,
      distanceFromSchool: data.distance_from_school || data.distanceFromSchool,
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at
    });
  }

  static toAPI(data) {
    if (!data) return null;

    // Handle coordinates properly - check both domain model format and form data format
    const coordinates = {};
    if (data.coordinates) {
      // Domain model format
      coordinates.lat = data.coordinates.lat;
      coordinates.lng = data.coordinates.lng;
    } else if (data.latitude !== undefined || data.longitude !== undefined) {
      // Form data format
      coordinates.lat = data.latitude ? parseFloat(data.latitude) : undefined;
      coordinates.lng = data.longitude ? parseFloat(data.longitude) : undefined;
    }

    const apiData = {
      stop_name: data.stopName || data.stop_name,
      stop_code: data.stopCode || data.stop_code,
      location: data.location?.id || data.location,
      is_active: data.isActive !== undefined ? data.isActive : data.is_active,
      notes: data.notes,
      pickup_time: data.pickupTime || data.pickup_time,
      drop_time: data.dropTime || data.drop_time,
      monthly_fee: data.monthlyFee || data.monthly_fee,
      distance_from_school: data.distanceFromSchool || data.distance_from_school
    };

    // Only include coordinates if they have valid values
    if (coordinates.lat !== undefined && coordinates.lng !== undefined) {
      apiData.coordinates = coordinates;
    }

    // Handle routes if present
    if (data.routes) {
      apiData.routes = data.routes.map(r => r.id || r);
    }

    // Clean up undefined values
    Object.keys(apiData).forEach(key => {
      if (apiData[key] === undefined) {
        delete apiData[key];
      }
    });

    return apiData;
  }

  static mapLocation(location) {
    if (!location) return null;
    const normalizedLocation = BusStopMapper.normalizeRelation(location);

    if (Array.isArray(normalizedLocation) && normalizedLocation.length > 0) {
      location = normalizedLocation[0];
    } else if (!normalizedLocation) {
      return null;
    }

    return LocationMapper.toDomain(location);
  }

  static mapCoordinates(data) {
    const coords = {
      lat: null,
      lng: null
    };

    if (data.coordinates) {
      if (data.coordinates.lat !== undefined) coords.lat = data.coordinates.lat;
      if (data.coordinates.lng !== undefined) coords.lng = data.coordinates.lng;
    } else {
      if (data.latitude !== undefined) coords.lat = data.latitude;
      if (data.longitude !== undefined) coords.lng = data.longitude;
    }

    return coords;
  }

  static mapRoutes(routes) {
    if (!routes) return [];
    const normalizedRoutes = BusStopMapper.normalizeRelation(routes);
    if (!Array.isArray(normalizedRoutes)) return [];

    // Avoid circular dependency - only return basic info
    // BusRouteMapper.mapBusStops references BusStopMapper
    return normalizedRoutes.map(route => ({
      id: route.id,
      documentId: route.documentId,
      routeName: route.route_name || route.routeName,
      routeCode: route.route_code || route.routeCode
    }));
  }

  static mapStudents(students) {
    if (!students) return [];
    const normalizedStudents = BusStopMapper.normalizeRelation(students);
    if (!Array.isArray(normalizedStudents)) return [];

    // Return basic student info to avoid circular dependencies
    return normalizedStudents.map(student => ({
      id: student.id,
      documentId: student.documentId,
      firstName: student.first_name || student.firstName,
      lastName: student.last_name || student.lastName,
      grFullName: student.gr_full_name
    }));
  }

  static normalizeRelation(relation) {
    if (!relation) return [];
    if (Array.isArray(relation)) return relation;
    if (relation.data) return Array.isArray(relation.data) ? relation.data : [relation.data];
    return [relation];
  }
}