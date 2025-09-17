import { ClassRepository } from '../../data/repositories/ClassRepository';

export class ClassService {
  constructor() {
    // No validation strategy for now, as class data is simple
  }

  async getAllClasses() {
    try {
      const classes = await ClassRepository.findAll();
      return {
        success: true,
        data: classes,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getClassById(id) {
    try {
      const classItem = await ClassRepository.findById(id);
      return {
        success: true,
        data: classItem,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createClass(data) {
    try {
      const newClass = await ClassRepository.create(data);
      return {
        success: true,
        data: newClass,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async updateClass(id, data) {
    try {
      const updatedClass = await ClassRepository.update(id, data);
      return {
        success: true,
        data: updatedClass,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async deleteClass(id) {
    try {
      await ClassRepository.delete(id);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
