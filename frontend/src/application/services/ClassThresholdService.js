import { ClassThresholdRepository } from '../../data/repositories/ClassThresholdRepository';

export class ClassThresholdService {
  async getAvailableCapacity(classId, divisionId = null) {
    try {
      const response = await ClassThresholdRepository.getAvailableCapacity(classId, divisionId);
      return { success: true, data: response };
    } catch (error) {
      console.error('Error in ClassThresholdService.getAvailableCapacity:', error);
      return { success: false, error: error.message };
    }
  }
}
