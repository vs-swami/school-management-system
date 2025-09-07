import { apiClient } from '../api/config';

export class DivisionRepository {
  static async findAll() {
    const response = await apiClient.get('/divisions');
    return response.data.data; // The transformResponseData interceptor will flatten this
  }
}
