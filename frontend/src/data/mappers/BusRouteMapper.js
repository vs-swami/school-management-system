import { BusRoute } from '../../domain/models/BusRoute';
import { BusStopMapper } from './BusStopMapper';
import { BusMapper } from './BusMapper';

export class BusRouteMapper {
  static toDomain(strapiData) {
    if (!strapiData) return null;

    if (Array.isArray(strapiData)) {
      return strapiData.map(item => BusRouteMapper.toDomain(item));
    }

    const data = strapiData.attributes || strapiData;

    const mappedRoute = new BusRoute({
      id: strapiData.id,
      documentId: strapiData.documentId || data.documentId,
      routeName: data.route_name || data.routeName,
      routeCode: data.route_code || data.routeCode,
      description: data.description,
      isActive: data.is_active !== undefined ? data.is_active : data.isActive,
      busStops: BusRouteMapper.mapBusStops(data.bus_stops || data.busStops),
      stopSchedules: BusRouteMapper.mapStopSchedules(data.stop_schedules || data.stopSchedules),
      buses: BusRouteMapper.mapBuses(data.buses),
      bus: BusRouteMapper.mapBus(data.bus),
      startTime: data.departure_time,
      endTime: data.arrival_time,
      distance: data.total_distance,
      estimatedDuration: data.estimated_duration || data.estimatedDuration,
      monthlyFee: data.monthly_fee || data.monthlyFee || 0,
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at
    });

    // Add original field names for backward compatibility with components
    mappedRoute.route_name = mappedRoute.routeName;
    mappedRoute.route_code = mappedRoute.routeCode;
    mappedRoute.bus_stops = mappedRoute.busStops;
    mappedRoute.stop_schedules = mappedRoute.stopSchedules;
    mappedRoute.is_active = mappedRoute.isActive;
    mappedRoute.start_time = mappedRoute.startTime;
    mappedRoute.end_time = mappedRoute.endTime;
    mappedRoute.estimated_duration = mappedRoute.estimatedDuration;
    mappedRoute.monthly_fee = mappedRoute.monthlyFee;

    return mappedRoute;
  }

  static toStrapi(domainModel) {
    if (!domainModel) return null;

    return {
      route_name: domainModel.routeName,
      route_code: domainModel.routeCode,
      description: domainModel.description,
      is_active: domainModel.isActive,
      bus_stops: domainModel.busStops?.map(s => s.id || s),
      buses: domainModel.buses?.map(b => b.id || b),
      start_time: domainModel.startTime,
      end_time: domainModel.endTime,
      distance: domainModel.distance,
      estimated_duration: domainModel.estimatedDuration,
      monthly_fee: domainModel.monthlyFee
    };
  }

  static toAPI(domainModel) {
    return BusRouteMapper.toStrapi(domainModel);
  }

  static mapBusStops(busStops) {
    if (!busStops) return [];
    const normalized = BusRouteMapper.normalizeRelation(busStops);
    if (!Array.isArray(normalized)) return [];

    return normalized.map(stop => BusStopMapper.toDomain(stop));
  }

  static mapStopSchedules(stopSchedules) {
    if (!stopSchedules) return [];
    if (!Array.isArray(stopSchedules)) return [];

    return stopSchedules.map(schedule => ({
      id: schedule.id,
      busStop: schedule.bus_stop ? BusStopMapper.toDomain(schedule.bus_stop) : null,
      pickupTime: schedule.pickup_time || schedule.pickupTime,
      dropTime: schedule.drop_time || schedule.dropTime,
      order: schedule.order || schedule.sequence
    }));
  }

  static mapBus(bus) {
    if (!bus) return null;
    const busData = bus.data || bus;
    if (!busData) return null;

    return BusMapper.toDomain(busData);
  }

  static mapBuses(buses) {
    if (!buses) return [];
    const normalized = BusRouteMapper.normalizeRelation(buses);
    if (!Array.isArray(normalized)) return [];

    return normalized.map(bus => BusMapper.toDomain(bus));
  }

  static normalizeRelation(relation) {
    if (!relation) return [];
    if (Array.isArray(relation)) return relation;
    if (relation.data) return Array.isArray(relation.data) ? relation.data : [relation.data];
    return [relation];
  }

  static toDomainList(strapiDataList) {
    // Handle Strapi v5 response with data wrapper
    if (strapiDataList && strapiDataList.data !== undefined) {
      if (Array.isArray(strapiDataList.data)) {
        return strapiDataList.data.map(item => BusRouteMapper.toDomain(item));
      }
      return [];
    }

    if (!Array.isArray(strapiDataList)) return [];
    return strapiDataList.map(item => BusRouteMapper.toDomain(item));
  }
}