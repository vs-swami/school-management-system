import { DivisionRepository } from '../../data/repositories/DivisionRepository';

export class DivisionService {
  constructor() {
    this.repository = DivisionRepository;
  }

  async getAllDivisions() {
    try {
      const divisions = await this.repository.findAll();
      return {
        success: true,
        data: divisions
      };
    } catch (error) {
      console.error('Error in DivisionService.getAllDivisions:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch divisions'
      };
    }
  }

  async getDivisionById(id) {
    try {
      const division = await this.repository.findById(id);
      return {
        success: true,
        data: division
      };
    } catch (error) {
      console.error('Error in DivisionService.getDivisionById:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch division'
      };
    }
  }

  async createDivision(divisionData) {
    try {
      const division = await this.repository.create(divisionData);
      return {
        success: true,
        data: division
      };
    } catch (error) {
      console.error('Error in DivisionService.createDivision:', error);
      return {
        success: false,
        error: error.message || 'Failed to create division',
        details: error.response?.data
      };
    }
  }

  async updateDivision(id, divisionData) {
    try {
      const division = await this.repository.update(id, divisionData);
      return {
        success: true,
        data: division
      };
    } catch (error) {
      console.error('Error in DivisionService.updateDivision:', error);
      return {
        success: false,
        error: error.message || 'Failed to update division',
        details: error.response?.data
      };
    }
  }

  async deleteDivision(id) {
    try {
      await this.repository.delete(id);
      return {
        success: true
      };
    } catch (error) {
      console.error('Error in DivisionService.deleteDivision:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete division'
      };
    }
  }

  async getDivisionMetrics(divisionId = null) {
    try {
      let metrics;
      if (divisionId) {
        metrics = await this.repository.getDivisionMetrics(divisionId);
      } else {
        metrics = await this.repository.getMetrics();
      }
      return {
        success: true,
        data: metrics
      };
    } catch (error) {
      console.error('Error in DivisionService.getDivisionMetrics:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch division metrics'
      };
    }
  }

  async getYearGroupComparison() {
    try {
      const comparison = await this.repository.getYearGroupComparison();
      return {
        success: true,
        data: comparison
      };
    } catch (error) {
      console.error('Error in DivisionService.getYearGroupComparison:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch year group comparison'
      };
    }
  }

  async getDivisionsWithMetrics() {
    try {
      const [divisions, metrics] = await Promise.all([
        this.repository.findAll(),
        this.repository.getMetrics()
      ]);

      return {
        success: true,
        data: {
          divisions,
          metrics
        }
      };
    } catch (error) {
      console.error('Error in DivisionService.getDivisionsWithMetrics:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch divisions with metrics'
      };
    }
  }
}