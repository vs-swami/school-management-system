import { StudentRepository } from '../../data/repositories/StudentRepository';
import { ValidationStrategy } from '../strategies/ValidationStrategy';
//import { AuditService } from './AuditService';

export class StudentService {
  constructor() {
    this.validationStrategy = new ValidationStrategy();
    //this.auditService = new AuditService();
  }

  async getAllStudents(filters = {}) {
    try {
      const students = await StudentRepository.findAll(filters);
      return {
        success: true,
        data: students,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getStudentById(id) {
    try {
      const student = await StudentRepository.findById(id);
      return {
        success: true,
        data: student,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createStudent(data, files) {
    try {
      // Validate data (only the plain data, not files)
      const validation = this.validationStrategy.validateStudent(data);
      if (!validation.isValid) {
        console.log('Validation errors:', validation);
        return {
          success: false,
          error: 'Validation failed',
          details: validation.errors,
        };
      }
      console.log('Creating student with data:', data);  
      const student = await StudentRepository.create(data, files);
      
      // Audit log
      //await this.auditService.log('STUDENT_CREATED', {
      //  studentId: student.id,
      //  studentName: student.gr_full_name,
      //});

      return {
        success: true,
        data: student,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async updateStudent(id, data, files) { // Changed from studentData to data, added files
    try {
      const validation = this.validationStrategy.validateStudent(data); // Validate data only
      if (!validation.isValid) {
        console.log('Validation errors:', validation);
        return {
          success: false,
          error: 'Validation failed',
          details: validation.errors,
        };
      }

      const student = await StudentRepository.update(id, data, files); // Pass data and files
      
      //await this.auditService.log('STUDENT_UPDATED', {
      //  studentId: id,
      //  studentName: student.gr_full_name,
      //});

      return {
        success: true,
        data: student,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async searchStudents(query) {
    try {
      const students = await StudentRepository.search(query);
      return {
        success: true,
        data: students,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getStatistics() {
    try {
      const stats = await StudentRepository.getStatistics();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}