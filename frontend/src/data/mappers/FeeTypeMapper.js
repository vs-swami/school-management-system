import { FeeType } from '../../domain/models/FeeType';

export class FeeTypeMapper {
  static toDomain(strapiData) {
    if (!strapiData) return null;

    // Handle Strapi v5 response with data wrapper
    if (strapiData.data !== undefined) {
      if (Array.isArray(strapiData.data)) {
        return strapiData.data.map(item => FeeTypeMapper.toDomain(item));
      } else if (strapiData.data) {
        return FeeTypeMapper.toDomain(strapiData.data);
      }
      return null;
    }

    if (Array.isArray(strapiData)) {
      return strapiData.map(item => FeeTypeMapper.toDomain(item));
    }

    // Handle Strapi 5 response structure
    const data = strapiData.attributes || strapiData;

    return new FeeType({
      id: strapiData.id,
      documentId: strapiData.documentId || data.documentId,
      code: data.code,
      name: data.name,
      active: data.active !== undefined ? data.active : true,
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at
    });
  }

  static toStrapi(domainModel) {
    if (!domainModel) return null;

    const data = {
      code: domainModel.code,
      name: domainModel.name,
      active: domainModel.active !== undefined ? domainModel.active : true
    };

    // Remove undefined fields
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    return data;
  }

  static toAPI(domainModel) {
    return FeeTypeMapper.toStrapi(domainModel);
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