import { apiClient } from '../api/config';

// Strapi 5: Return raw API data - all transformations handled by mappers
export const StudentRepository = {
  async findAll(filters = {}) {
    try {
      const params = {
        populate: '*',
        ...filters
      };

      const response = await apiClient.get('/students', { params });
      console.log('StudentRepository findAll - raw response:', response.data);
      // Strapi v5 returns { data: [...], meta: {...} }
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  async findById(id) {
    try {
      const params = {
        populate: '*'
      };

      const response = await apiClient.get(`/students/${id}`, { params });
      console.log("Student Repository - DATA - ", response)
      // Return the full response for the mapper to handle
      return response.data;
    } catch (error) {
      console.error('Error fetching student by ID:', error);
      throw error;
    }
  },

  async findWithDetails(id) {
    return this.findById(id);
  },

  async findByGrNo(grNo) {
    try {
      const params = {
        filters: {
          gr_no: {
            $eq: grNo
          }
        },
        populate: '*'
      };

      const response = await apiClient.get('/students', { params });
      // Return the full response for mapper to handle
      const students = response.data?.data || [];
      return students[0] || null;
    } catch (error) {
      console.error('Error fetching student by GR number:', error);
      throw error;
    }
  },

  async create(studentData) {
    try {
      // Check if studentData has a 'data' wrapper
      const data = studentData.data || studentData;

      console.log('StudentRepository.create - Data being sent:', data);

      // Process files if they exist
      let files = null;
      if (data.files) {
        files = data.files;
        delete data.files;
      }

      // If there are files, use FormData; otherwise, send JSON directly
      if (files && Object.keys(files).length > 0) {
        const formData = new FormData();

        // Log the data being sent
        console.log('StudentRepository.create - JSON data being appended to FormData:', JSON.stringify(data, null, 2));

        // Append student data
        formData.append('data', JSON.stringify(data));

        // Append files
        Object.keys(files).forEach(key => {
          if (files[key]) {
            formData.append(`files.${key}`, files[key]);
          }
        });

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };

        const response = await apiClient.post('/students', formData, config);
        return response.data;
      } else {
        // No files, send as JSON
        console.log('StudentRepository.create - Sending as JSON:', JSON.stringify({ data }, null, 2));

        const response = await apiClient.post('/students', { data });
        return response.data;
      }
    } catch (error) {
      console.error('Error creating student:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  async update(id, studentData) {
    try {
      const formData = new FormData();

      // Check if studentData has a 'data' wrapper
      const data = studentData.data || studentData;

      // Process files if they exist
      let files = null;
      if (data.files) {
        files = data.files;
        delete data.files;
      }

      // Append student data
      formData.append('data', JSON.stringify(data));

      // Append files if they exist
      if (files) {
        Object.keys(files).forEach(key => {
          if (files[key]) {
            formData.append(`files.${key}`, files[key]);
          }
        });
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await apiClient.put(`/students/${id}`, formData, config);
      return response.data;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await apiClient.delete(`/students/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  async findByClass(classId) {
    try {
      const params = {
        filters: {
          enrollments: {
            class: {
              id: { $eq: classId }
            }
          }
        },
        populate: '*'
      };

      const response = await apiClient.get('/students', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching students by class:', error);
      throw error;
    }
  },

  async findByDivision(divisionId) {
    try {
      const params = {
        filters: {
          enrollments: {
            administration: {
              division: {
                id: { $eq: divisionId }
              }
            }
          }
        },
        populate: '*'
      };

      const response = await apiClient.get('/students', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching students by division:', error);
      throw error;
    }
  },

  async findByEnrollmentStatus(status) {
    try {
      const params = {
        filters: {
          enrollments: {
            enrollment_status: { $eq: status }
          }
        },
        populate: '*'
      };

      const response = await apiClient.get('/students', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching students by enrollment status:', error);
      throw error;
    }
  },

  async search(query) {
    try {
      const params = {
        filters: {
          $or: [
            { gr_full_name: { $containsi: query } },
            { aadhaar_full_name: { $containsi: query } },
            { first_name: { $containsi: query } },
            { last_name: { $containsi: query } }
          ]
        },
        populate: '*'
      };

      const response = await apiClient.get('/students', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching students:', error);
      throw error;
    }
  },

  async getStatistics() {
    try {
      // Get total students count
      const totalResponse = await apiClient.get('/students', {
        params: {
          pagination: {
            pageSize: 1
          }
        }
      });

      // Get active students
      const activeResponse = await apiClient.get('/students', {
        params: {
          filters: {
            enrollments: {
              enrollment_status: { $eq: 'Enrolled' }
            }
          },
          pagination: {
            pageSize: 1
          }
        }
      });

      return {
        total: totalResponse.data.meta?.pagination?.total || 0,
        active: activeResponse.data.meta?.pagination?.total || 0,
        inactive: 0
      };
    } catch (error) {
      console.error('Error fetching student statistics:', error);
      throw error;
    }
  }
};