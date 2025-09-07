import { apiClient } from '../api/config';

export class AcademicYearRepository {
  static async findAll() {
    const response = await apiClient.get('/academic-years');
    return response.data.data; // The transformResponseData interceptor will flatten this
  }
}
