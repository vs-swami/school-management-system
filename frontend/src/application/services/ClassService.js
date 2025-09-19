import { ClassRepository } from '../../data/repositories/ClassRepository';
import { DivisionRepository } from '../../data/repositories/DivisionRepository';
import { EnrollmentRepository } from '../../data/repositories/EnrollmentRepository';

export class ClassService {
  constructor() {
    this.classRepository = ClassRepository;
    this.divisionRepository = DivisionRepository;
    this.enrollmentRepository = EnrollmentRepository;
  }

  async getAllClasses() {
    try {
      const classes = await this.classRepository.findAll();
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
      const classes = await this.classRepository.findAllWithSummary();
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
      const classItem = await this.classRepository.findById(id);
      return {
        success: true,
        data: classItem,
      };
    } catch (error) {
      console.error('Error in ClassService.getClassById:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch class',
      };
    }
  }

  async createClass(data) {
    try {
      const newClass = await this.classRepository.create(data);
      return {
        success: true,
        data: newClass,
      };
    } catch (error) {
      console.error('Error in ClassService.createClass:', error);
      return {
        success: false,
        error: error.message || 'Failed to create class',
        details: error.response?.data
      };
    }
  }

  async updateClass(id, data) {
    try {
      const updatedClass = await this.classRepository.update(id, data);
      return {
        success: true,
        data: updatedClass,
      };
    } catch (error) {
      console.error('Error in ClassService.updateClass:', error);
      return {
        success: false,
        error: error.message || 'Failed to update class',
        details: error.response?.data
      };
    }
  }

  async deleteClass(id) {
    try {
      await this.classRepository.delete(id);
      return {
        success: true,
      };
    } catch (error) {
      console.error('Error in ClassService.deleteClass:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete class',
      };
    }
  }

  async getClassMetrics() {
    try {
      const metrics = await this.classRepository.getMetrics();
      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      console.error('Error in ClassService.getClassMetrics:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch class metrics',
      };
    }
  }

  async getDivisions() {
    try {
      const divisions = await this.divisionRepository.findAll();
      return {
        success: true,
        data: divisions,
      };
    } catch (error) {
      console.error('Error in ClassService.getDivisions:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch divisions',
      };
    }
  }

  async getEnrollments() {
    try {
      const enrollments = await this.enrollmentRepository.getAllEnrollments();
      return {
        success: true,
        data: enrollments,
      };
    } catch (error) {
      console.error('Error in ClassService.getEnrollments:', error);

      if (error.response?.status === 403 || error.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication required. Please log in to view class data.',
        };
      }

      return {
        success: false,
        error: error.message || 'Failed to fetch enrollment data',
      };
    }
  }

  async getAllClassData() {
    try {
      const [classesResult, divisionsResult, enrollmentsResult] = await Promise.all([
        this.getClassesWithSummary(),
        this.getDivisions(),
        this.getEnrollments()
      ]);

      if (!classesResult.success || !divisionsResult.success || !enrollmentsResult.success) {
        return {
          success: false,
          error: classesResult.error || divisionsResult.error || enrollmentsResult.error,
          data: {
            classes: classesResult.success ? classesResult.data : [],
            divisions: divisionsResult.success ? divisionsResult.data : [],
            enrollments: enrollmentsResult.success ? enrollmentsResult.data : []
          }
        };
      }

      return {
        success: true,
        data: {
          classes: classesResult.data,
          divisions: divisionsResult.data,
          enrollments: enrollmentsResult.data
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
