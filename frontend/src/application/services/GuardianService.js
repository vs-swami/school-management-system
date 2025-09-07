import { GuardianRepository } from '../../data/repositories/GuardianRepository';
import { ValidationStrategy } from '../strategies/ValidationStrategy';

export class GuardianService {
  constructor() {
    this.validationStrategy = new ValidationStrategy();
  }

  async getAllGuardians(filters = {}) {
    try {
      const guardians = await GuardianRepository.findAll(filters);
      return {
        success: true,
        data: guardians,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getGuardianById(id) {
    try {
      const guardian = await GuardianRepository.findById(id);
      return {
        success: true,
        data: guardian,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createGuardian(guardianData) {
    try {
      // TODO: Implement validateGuardian in ValidationStrategy
      // const validation = this.validationStrategy.validateGuardian(guardianData);
      // if (!validation.isValid) {
      //   return {
      //     success: false,
      //     error: 'Validation failed',
      //     details: validation.errors,
      //   };
      // }
      const guardian = await GuardianRepository.create(guardianData);
      return {
        success: true,
        data: guardian,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async updateGuardian(id, guardianData) {
    try {
      // TODO: Implement validateGuardian in ValidationStrategy
      // const validation = this.validationStrategy.validateGuardian(guardianData);
      // if (!validation.isValid) {
      //   return {
      //     success: false,
      //     error: 'Validation failed',
      //     details: validation.errors,
      //   };
      // }
      const guardian = await GuardianRepository.update(id, guardianData);
      return {
        success: true,
        data: guardian,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async deleteGuardian(id) {
    try {
      const response = await GuardianRepository.delete(id);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async searchGuardians(query) {
    try {
      const guardians = await GuardianRepository.search(query);
      return {
        success: true,
        data: guardians,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
