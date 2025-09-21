import { AcademicYearRepositoryAdapter } from '../../data/adapters/AcademicYearRepositoryAdapter';

export class AcademicYearService {
  constructor() {
    this.repository = new AcademicYearRepositoryAdapter();
  }

  async getAllAcademicYears() {
    try {
      const years = await this.repository.findAll();
      return {
        success: true,
        data: years,
      };
    } catch (error) {
      console.error('Error in AcademicYearService.getAllAcademicYears:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch academic years',
      };
    }
  }

  async getAcademicYearById(id) {
    try {
      const year = await this.repository.findById(id);
      return {
        success: true,
        data: year,
      };
    } catch (error) {
      console.error('Error in AcademicYearService.getAcademicYearById:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch academic year with id ${id}`,
      };
    }
  }

  async getCurrentAcademicYear() {
    try {
      const currentYear = await this.repository.findCurrent();
      return {
        success: true,
        data: currentYear,
      };
    } catch (error) {
      console.error('Error in AcademicYearService.getCurrentAcademicYear:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch current academic year',
      };
    }
  }

  async createAcademicYear(yearData) {
    try {
      const newYear = await this.repository.create(yearData);
      return {
        success: true,
        data: newYear,
      };
    } catch (error) {
      console.error('Error in AcademicYearService.createAcademicYear:', error);
      return {
        success: false,
        error: error.message || 'Failed to create academic year',
      };
    }
  }

  async updateAcademicYear(id, yearData) {
    try {
      const updatedYear = await this.repository.update(id, yearData);
      return {
        success: true,
        data: updatedYear,
      };
    } catch (error) {
      console.error('Error in AcademicYearService.updateAcademicYear:', error);
      return {
        success: false,
        error: error.message || `Failed to update academic year with id ${id}`,
      };
    }
  }

  async deleteAcademicYear(id) {
    try {
      const result = await this.repository.delete(id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error in AcademicYearService.deleteAcademicYear:', error);
      return {
        success: false,
        error: error.message || `Failed to delete academic year with id ${id}`,
      };
    }
  }

  async setCurrentAcademicYear(id) {
    try {
      const result = await this.repository.setCurrent(id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error in AcademicYearService.setCurrentAcademicYear:', error);
      return {
        success: false,
        error: error.message || `Failed to set academic year ${id} as current`,
      };
    }
  }
}