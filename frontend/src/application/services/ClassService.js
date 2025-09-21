import { ClassRepositoryAdapter } from '../../data/adapters/ClassRepositoryAdapter';

export class ClassService {
  constructor() {
    this.repository = new ClassRepositoryAdapter();
  }

  async getAllClasses() {
    try {
      const classes = await this.repository.findAll();
      return {
        success: true,
        data: classes,
      };
    } catch (error) {
      console.error('Error in ClassService.getAllClasses:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch classes',
      };
    }
  }

  async getClassesWithSummary() {
    try {
      const classes = await this.repository.findWithSummary();
      return {
        success: true,
        data: classes,
      };
    } catch (error) {
      console.error('Error in ClassService.getClassesWithSummary:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch classes with summary',
      };
    }
  }

  async getClassById(id) {
    try {
      const classItem = await this.repository.findById(id);
      return {
        success: true,
        data: classItem,
      };
    } catch (error) {
      console.error('Error in ClassService.getClassById:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch class with id ${id}`,
      };
    }
  }

  async getClassWithStats(id) {
    try {
      const stats = await this.repository.findWithStats(id);
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error('Error in ClassService.getClassWithStats:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch class stats for id ${id}`,
      };
    }
  }

  async createClass(classData) {
    try {
      const newClass = await this.repository.create(classData);
      return {
        success: true,
        data: newClass,
      };
    } catch (error) {
      console.error('Error in ClassService.createClass:', error);
      return {
        success: false,
        error: error.message || 'Failed to create class',
      };
    }
  }

  async updateClass(id, classData) {
    try {
      const updatedClass = await this.repository.update(id, classData);
      return {
        success: true,
        data: updatedClass,
      };
    } catch (error) {
      console.error('Error in ClassService.updateClass:', error);
      return {
        success: false,
        error: error.message || `Failed to update class with id ${id}`,
      };
    }
  }

  async deleteClass(id) {
    try {
      const result = await this.repository.delete(id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error in ClassService.deleteClass:', error);
      return {
        success: false,
        error: error.message || `Failed to delete class with id ${id}`,
      };
    }
  }

  async getActiveClasses() {
    try {
      const classes = await this.repository.findActiveClasses();
      return {
        success: true,
        data: classes,
      };
    } catch (error) {
      console.error('Error in ClassService.getActiveClasses:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch active classes',
      };
    }
  }

  async getClassesByAcademicYear(academicYearId) {
    try {
      const classes = await this.repository.findByAcademicYear(academicYearId);
      return {
        success: true,
        data: classes,
      };
    } catch (error) {
      console.error('Error in ClassService.getClassesByAcademicYear:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch classes for academic year ${academicYearId}`,
      };
    }
  }

  async getClassMetrics(classId) {
    try {
      const metrics = await this.repository.getClassMetrics(classId);
      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      console.error('Error in ClassService.getClassMetrics:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch metrics for class ${classId}`,
      };
    }
  }

  // These methods would need separate repository adapters
  async getDivisions() {
    try {
      // TODO: Use DivisionRepositoryAdapter when created
      const { DivisionRepository } = await import('../../data/repositories/DivisionRepository');
      const divisions = await DivisionRepository.findAll();
      return {
        success: true,
        data: divisions || [],
      };
    } catch (error) {
      console.error('Error in ClassService.getDivisions:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch divisions',
        data: [], // Return empty array on error
      };
    }
  }

  async getEnrollments() {
    try {
      // TODO: Use EnrollmentRepositoryAdapter when created
      const { EnrollmentRepository } = await import('../../data/repositories/EnrollmentRepository');
      const enrollments = await EnrollmentRepository.getAllEnrollments();
      return {
        success: true,
        data: enrollments || [],
      };
    } catch (error) {
      console.error('Error in ClassService.getEnrollments:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch enrollments',
        data: [], // Return empty array on error
      };
    }
  }

  async getAllClassData() {
    try {
      const [classesResult, divisionsResult, enrollmentsResult] = await Promise.all([
        this.getAllClasses(),
        this.getDivisions(),
        this.getEnrollments()
      ]);

      // Log which requests failed for debugging
      if (!classesResult.success) {
        console.error('Failed to fetch classes:', classesResult.error);
      }
      if (!divisionsResult.success) {
        console.error('Failed to fetch divisions:', divisionsResult.error);
      }
      if (!enrollmentsResult.success) {
        console.error('Failed to fetch enrollments:', enrollmentsResult.error);
      }

      // Return partial data even if some requests fail
      return {
        success: classesResult.success && divisionsResult.success && enrollmentsResult.success,
        data: {
          classes: classesResult.data || [],
          divisions: divisionsResult.data || [],
          enrollments: enrollmentsResult.data || []
        },
        errors: {
          classes: classesResult.error,
          divisions: divisionsResult.error,
          enrollments: enrollmentsResult.error
        }
      };
    } catch (error) {
      console.error('Error in ClassService.getAllClassData:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch all class data',
        data: {
          classes: [],
          divisions: [],
          enrollments: []
        }
      };
    }
  }
}