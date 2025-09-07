import { apiClient } from '../api/config';

// Helper function to transform Strapi API response structure
const transformStudentResponse = (studentData) => {
  if (!studentData) return null;

  // If it's a list of students
  if (Array.isArray(studentData)) {
    return studentData.map(item => transformStudentResponse(item));
  }

  // If it's a single student object with an 'attributes' key
  if (studentData.attributes) {
    const transformed = {
      id: studentData.id,
      ...studentData.attributes,
    };

    // Recursively transform nested relations
    for (const key in transformed) {
      if (transformed[key] && typeof transformed[key] === 'object' && transformed[key].data) {
        // Handle one-to-many or many-to-many relations
        if (Array.isArray(transformed[key].data)) {
          transformed[key] = transformed[key].data.map(item => ({ id: item.id, ...item.attributes }));
        } else if (transformed[key].data.attributes) {
          // Handle one-to-one or many-to-one relations
          transformed[key] = { id: transformed[key].data.id, ...transformed[key].data.attributes };
        } else {
            transformed[key] = null; // No attributes, set to null
        }
      }
    }
    return transformed;
  }

  // If it's already a flattened object or a simple value
  return studentData;
};

export class StudentRepository {
  static async findAll(params = {}) {
    // Explicitly populate relations for the student list view
    const populateParams = {
      populate: {
        guardians: true,
        enrollments: {
          populate: {
            academic_year: true,
            division: true
          }
        }
      }
    };
    
    const response = await apiClient.get('/students', {
      params: { ...params, ...populateParams }
    });
    return transformStudentResponse(response.data.data); // Apply transformation here
  }

  static async findById(id) {
    const populateParams = {
      populate: {
        guardians: true,
        enrollments: {
          populate: {
            academic_year: true,
            division: true
          }
        }
      }
    };
    const response = await apiClient.get(`/students/${id}`, { params: populateParams });
    return transformStudentResponse(response.data.data); // Apply transformation here
  }

  static async create(data, files) {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (files.student_photo) {
      formData.append('student_photo', files.student_photo);
    }
    if (files.guardian_photo) {
      formData.append('guardian_photo', files.guardian_photo);
    }
    const response = await apiClient.post('/students', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('API response from create:', response);
    return transformStudentResponse(response.data.data); // Apply transformation here
  }

  static async update(id, data, files) {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (files.student_photo) {
      formData.append('student_photo', files.student_photo);
    }
    if (files.guardian_photo) {
      formData.append('guardian_photo', files.guardian_photo);
    }
    console.log('Updating student with ID:', id, 'and data:', data, 'and files:', files);
    const response = await apiClient.put(`/students/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return transformStudentResponse(response.data.data); // Apply transformation here
  }

  static async delete(id) {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data; // Deletion usually doesn't require transformation
  }

  static async getStatistics() {
    const response = await apiClient.get('/students/statistics');
    return response.data;
  }

  static async search(query) {
    const response = await apiClient.get('/students', {
      params: {
        filters: {
          $or: [
            { gr_full_name: { $containsi: query } },
            { first_name: { $containsi: query } },
            { last_name: { $containsi: query } }
          ]
        }
      }
    });
    return transformStudentResponse(response.data.data); // Apply transformation here
  }
}