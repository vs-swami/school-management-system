import { apiClient } from '../api/config';

export class AcademicYearRepository {
  static async findAll() {
    const response = await apiClient.get('/academic-years');

    // Strapi 5: Handle response structure { data: [...], meta: {} }
    let academicYears = response.data;

    // If response has nested data array, extract it
    if (academicYears && typeof academicYears === 'object' && academicYears.data) {
      academicYears = academicYears.data;
    }

    // Ensure we always return an array
    return Array.isArray(academicYears) ? academicYears : [];
  }
}
