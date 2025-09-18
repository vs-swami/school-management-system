import { apiClient } from '../api/config';

// Optimized helper function for Strapi 5 response structure
const transformStudentResponse = (studentData) => {
  if (!studentData) return null;

  // If it's a list of students, recursively transform each item
  if (Array.isArray(studentData)) {
    return studentData.map(item => transformStudentResponse(item));
  }

  // Helper function to normalize relations for Strapi 5
  const normalizeRelation = (relation) => {
    if (!relation) return null;
    
    // Strapi 5: relations can be direct objects or arrays
    if (Array.isArray(relation)) {
      return relation;
    }
    
    // If it has .data, extract it (legacy support)
    if (relation.data) {
      return relation.data;
    }
    
    // Already normalized (direct object)
    return relation;
  };

  // Start with the student data (attributes are flattened in Strapi 5)
  const transformed = {
    id: studentData.id,
    documentId: studentData.documentId, // Strapi 5 uses documentId
    ...studentData,
  };

  // Handle enrollments - in Strapi 5, this should be a direct array or object
  if (transformed.enrollments) {
    const enrollmentsData = normalizeRelation(transformed.enrollments);
    
    if (Array.isArray(enrollmentsData)) {
      transformed.enrollments = enrollmentsData.map(enrollment => ({
        id: enrollment.id,
        documentId: enrollment.documentId,
        ...enrollment,
        class: normalizeRelation(enrollment.class),
        academic_year: normalizeRelation(enrollment.academic_year),
        administration: normalizeRelation(enrollment.administration),
      }));
    } else if (enrollmentsData) {
      // Single enrollment object
      const enrollment = enrollmentsData;
      transformed.enrollments = [{
        id: enrollment.id,
        documentId: enrollment.documentId,
        ...enrollment,
        class: normalizeRelation(enrollment.class),
        academic_year: normalizeRelation(enrollment.academic_year),
        administration: normalizeRelation(enrollment.administration),
      }];
    } else {
      transformed.enrollments = [];
    }

    // Further normalize administration.division if it exists
    transformed.enrollments.forEach(enrollment => {
      if (enrollment.administration?.division) {
        enrollment.administration.division = normalizeRelation(
          enrollment.administration.division
        );
      }
    });
  } else {
    transformed.enrollments = [];
  }

  // Process documents - Strapi 5 structure
  if (transformed.documents) {
    const documentsData = normalizeRelation(transformed.documents);
    
    if (Array.isArray(documentsData)) {
      transformed.documents = documentsData.map(doc => {
        // In Strapi 5, file relations are flatter
        const fileUrl = doc.file?.url || doc.file?.data?.url || null;
        return {
          id: doc.id,
          documentId: doc.documentId,
          document_type: doc.document_type,
          description: doc.description || null,
          url: fileUrl,
          file: doc.file
        };
      });
    } else {
      transformed.documents = [];
    }
  } else {
    transformed.documents = [];
  }

  // Process guardians
  if (transformed.guardians) {
    const guardiansData = normalizeRelation(transformed.guardians);
    
    if (Array.isArray(guardiansData)) {
      transformed.guardians = guardiansData.map(guardian => ({
        id: guardian.id,
        documentId: guardian.documentId,
        ...guardian
      }));
    } else {
      transformed.guardians = [];
    }
  } else {
    transformed.guardians = [];
  }

  // Process exam_results
  if (transformed.exam_results) {
    const examResultsData = normalizeRelation(transformed.exam_results);
    
    if (Array.isArray(examResultsData)) {
      transformed.exam_results = examResultsData.map(result => ({
        id: result.id,
        documentId: result.documentId,
        ...result
      }));
    } else {
      transformed.exam_results = [];
    }
  } else {
    transformed.exam_results = [];
  }

  // Process single relations (place, caste, house)
  transformed.place = normalizeRelation(transformed.place);
  transformed.caste = normalizeRelation(transformed.caste);
  transformed.house = normalizeRelation(transformed.house);
  
  // Clean up legacy fields
  delete transformed.student_photo;
  delete transformed.student_photo_id;
  delete transformed.guardian_photo;
  delete transformed.guardian_photo_id;

  return transformed;
};

// Updated Repository for Strapi 5
export class StudentRepository {
  static async findAll(params = {}) {
    try {
      // Reverting to string-based populate for findAll
      const populateParams = {
        populate: [
          'guardians',
          // 'place',
          // 'caste',
          // 'house',
          // 'enrollments.academic_year',
          // 'enrollments.class',
          // 'enrollments.admission_type',
          // 'enrollments.administration.division',
          // 'documents.file',
          // 'exam_results'
        ].join(',')
      };
      
      const response = await apiClient.get('/students', {
        params: { ...params, ...populateParams }
      });
      
      return transformStudentResponse(response.data.data);
    } catch (error) {
      console.error('StudentRepository Error in findAll:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const populateParams = {
        populate: {
          guardians: true,
          place: true,
          caste: true,
          house: true,
          enrollments: {
            populate: {
              academic_year: true,
              class: true,
              admission_type: true,
              administration: {
                populate: {
                  division: true,
                  seat_allocations: {
                    populate: {
                      bus: true,
                      pickup_stop: {
                        populate: {
                          location: true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          documents: {
            populate: {
              file: true
            }
          },
          exam_results: true
        }
      };
      
      const response = await apiClient.get(`/students/${id}`, { params: populateParams });
      return transformStudentResponse(response.data.data);
    } catch (error) {
      console.error('StudentRepository Error in findById:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const response = await apiClient.post('/students', { data }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return transformStudentResponse(response.data.data);
    } catch (error) {
      console.error('StudentRepository Error in create:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const response = await apiClient.put(`/students/${id}`, { data }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return transformStudentResponse(response.data.data);
    } catch (error) {
      console.error('StudentRepository Error in update:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const response = await apiClient.delete(`/students/${id}`);
      return response.data;
    } catch (error) {
      console.error('StudentRepository Error in delete:', error);
      throw error;
    }
  }

  static async getStatistics() {
    try {
      const response = await apiClient.get('/students/statistics');
      return response.data;
    } catch (error) {
      console.error('StudentRepository Error in getStatistics:', error);
      throw error;
    }
  }

  static async search(query) {
    try {
      // Reverting to string-based populate for search
      const searchParams = {
        populate: [
          'guardians',
          'place',
          'caste',
          'house',
          'enrollments.academic_year',
          'enrollments.class',
          'enrollments.admission_type',
          'enrollments.administration.division',
          'documents.file',
          'exam_results'
        ].join(','),
        filters: {
          $or: [
            { gr_full_name: { $containsi: query } },
            { first_name: { $containsi: query } },
            { last_name: { $containsi: query } }
          ]
        }
      };
      
      const response = await apiClient.get('/students', {
        params: searchParams
      });
      
      return transformStudentResponse(response.data.data);
    } catch (error) {
      console.error('StudentRepository Error in search:', error);
      throw error;
    }
  }
}