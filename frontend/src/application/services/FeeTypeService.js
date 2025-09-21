import { FeeTypeRepositoryAdapter } from '../../data/adapters/FeeTypeRepositoryAdapter';

export class FeeTypeService {
  constructor() {
    this.repository = new FeeTypeRepositoryAdapter();
  }

  async getAllFeeTypes() {
    try {
      const types = await this.repository.findAll();
      return {
        success: true,
        data: types,
      };
    } catch (error) {
      console.error('Error in FeeTypeService.getAllFeeTypes:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch fee types',
      };
    }
  }

  async getFeeTypeById(id) {
    try {
      const type = await this.repository.findById(id);
      return {
        success: true,
        data: type,
      };
    } catch (error) {
      console.error('Error in FeeTypeService.getFeeTypeById:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch fee type with id ${id}`,
      };
    }
  }

  async createFeeType(typeData) {
    try {
      const newType = await this.repository.create(typeData);
      return {
        success: true,
        data: newType,
      };
    } catch (error) {
      console.error('Error in FeeTypeService.createFeeType:', error);
      return {
        success: false,
        error: error.message || 'Failed to create fee type',
      };
    }
  }

  async updateFeeType(id, typeData) {
    try {
      const updatedType = await this.repository.update(id, typeData);
      return {
        success: true,
        data: updatedType,
      };
    } catch (error) {
      console.error('Error in FeeTypeService.updateFeeType:', error);
      return {
        success: false,
        error: error.message || `Failed to update fee type with id ${id}`,
      };
    }
  }

  async deleteFeeType(id) {
    try {
      const result = await this.repository.delete(id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error in FeeTypeService.deleteFeeType:', error);
      return {
        success: false,
        error: error.message || `Failed to delete fee type with id ${id}`,
      };
    }
  }
}