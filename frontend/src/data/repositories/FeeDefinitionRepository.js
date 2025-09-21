import { apiClient } from '../api/config';

export class FeeDefinitionRepository {
  static async findAll(params = {}) {
    const defaultParams = {
      populate: { type: true, installments: true },
      sort: ['name:asc']
    };
    console.log('FeeDefinitionRepository.findAll - Making API call to /fee-definitions');
    const response = await apiClient.get('/fee-definitions', { params: { ...defaultParams, ...params } });
    console.log('FeeDefinitionRepository.findAll - Response:', response.data);
    return response.data;
  }

  static async findById(id, params = {}) {
    const defaultParams = { populate: { type: true, installments: true } };
    const response = await apiClient.get(`/fee-definitions/${id}`, { params: { ...defaultParams, ...params } });
    return response.data;
  }

  static async create(data) {
    console.log('FeeDefinitionRepository.create - Input data:', JSON.stringify(data, null, 2));
    console.log('FeeDefinitionRepository.create - Sending payload:', JSON.stringify({ data }, null, 2));

    const response = await apiClient.post('/fee-definitions', { data });

    console.log('FeeDefinitionRepository.create - Response status:', response.status);
    console.log('FeeDefinitionRepository.create - Response headers:', response.headers);
    console.log('FeeDefinitionRepository.create - Response data:', JSON.stringify(response.data, null, 2));

    // Check different possible response structures
    const responseData = response.data;

    // Strapi v5 might return data in response.data.data
    if (responseData && responseData.data) {
      console.log('FeeDefinitionRepository.create - Found nested data, returning:', JSON.stringify(responseData.data, null, 2));
      return responseData.data;
    }

    console.log('FeeDefinitionRepository.create - Returning direct response data:', JSON.stringify(responseData, null, 2));
    return responseData;
  }

  static async update(id, data) {
    const response = await apiClient.put(`/fee-definitions/${id}`, { data });
    return response.data;
  }

  static async delete(id) {
    const response = await apiClient.delete(`/fee-definitions/${id}`);
    return response.data;
  }
}

