import { FeeRepositoryAdapter } from '../../data/adapters/FeeRepositoryAdapter';

export class FeeService {
  constructor() {
    this.repository = new FeeRepositoryAdapter();
  }

  // Fee Definition methods
  async getAllFeeDefinitions() {
    try {
      const definitions = await this.repository.findAllDefinitions();
      return {
        success: true,
        data: definitions,
      };
    } catch (error) {
      console.error('Error in FeeService.getAllFeeDefinitions:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch fee definitions',
      };
    }
  }

  async getFeeDefinitionById(id) {
    try {
      const definition = await this.repository.findDefinitionById(id);
      return {
        success: true,
        data: definition,
      };
    } catch (error) {
      console.error('Error in FeeService.getFeeDefinitionById:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch fee definition with id ${id}`,
      };
    }
  }

  async createFeeDefinition(definitionData) {
    try {
      console.log('FeeService.createFeeDefinition - Input data:', definitionData);
      const newDefinition = await this.repository.createDefinition(definitionData);
      return {
        success: true,
        data: newDefinition,
      };
    } catch (error) {
      console.error('Error in FeeService.createFeeDefinition:', error);
      return {
        success: false,
        error: error.message || 'Failed to create fee definition',
      };
    }
  }

  async updateFeeDefinition(id, definitionData) {
    try {
      const updatedDefinition = await this.repository.updateDefinition(id, definitionData);
      return {
        success: true,
        data: updatedDefinition,
      };
    } catch (error) {
      console.error('Error in FeeService.updateFeeDefinition:', error);
      return {
        success: false,
        error: error.message || `Failed to update fee definition with id ${id}`,
      };
    }
  }

  async deleteFeeDefinition(id) {
    try {
      const result = await this.repository.deleteDefinition(id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error in FeeService.deleteFeeDefinition:', error);
      return {
        success: false,
        error: error.message || `Failed to delete fee definition with id ${id}`,
      };
    }
  }

  // Fee Assignment methods
  async getAllFeeAssignments() {
    try {
      const assignments = await this.repository.findAllAssignments();
      return {
        success: true,
        data: assignments,
      };
    } catch (error) {
      console.error('Error in FeeService.getAllFeeAssignments:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch fee assignments',
      };
    }
  }

  async getFeeAssignmentById(id) {
    try {
      const assignment = await this.repository.findAssignmentById(id);
      return {
        success: true,
        data: assignment,
      };
    } catch (error) {
      console.error('Error in FeeService.getFeeAssignmentById:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch fee assignment with id ${id}`,
      };
    }
  }

  async createFeeAssignment(assignmentData) {
    try {
      console.log('FeeService.createFeeAssignment - Input data:', assignmentData);
      const newAssignment = await this.repository.createAssignment(assignmentData);
      return {
        success: true,
        data: newAssignment,
      };
    } catch (error) {
      console.error('Error in FeeService.createFeeAssignment:', error);
      return {
        success: false,
        error: error.message || 'Failed to create fee assignment',
      };
    }
  }

  async updateFeeAssignment(id, assignmentData) {
    try {
      const updatedAssignment = await this.repository.updateAssignment(id, assignmentData);
      return {
        success: true,
        data: updatedAssignment,
      };
    } catch (error) {
      console.error('Error in FeeService.updateFeeAssignment:', error);
      return {
        success: false,
        error: error.message || `Failed to update fee assignment with id ${id}`,
      };
    }
  }

  async deleteFeeAssignment(id) {
    try {
      const result = await this.repository.deleteAssignment(id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error in FeeService.deleteFeeAssignment:', error);
      return {
        success: false,
        error: error.message || `Failed to delete fee assignment with id ${id}`,
      };
    }
  }

  async getFeeAssignmentsByClass(classId) {
    try {
      const assignments = await this.repository.findAssignmentsByClass(classId);
      return {
        success: true,
        data: assignments,
      };
    } catch (error) {
      console.error('Error in FeeService.getFeeAssignmentsByClass:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch fee assignments for class ${classId}`,
      };
    }
  }

  async getFeeAssignmentsByStudent(studentId) {
    try {
      const assignments = await this.repository.findAssignmentsByStudent(studentId);
      return {
        success: true,
        data: assignments,
      };
    } catch (error) {
      console.error('Error in FeeService.getFeeAssignmentsByStudent:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch fee assignments for student ${studentId}`,
      };
    }
  }

  async getFeeAssignmentsByBusStop(busStopId) {
    try {
      const assignments = await this.repository.findAssignmentsByBusStop(busStopId);
      return {
        success: true,
        data: assignments,
      };
    } catch (error) {
      console.error('Error in FeeService.getFeeAssignmentsByBusStop:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch fee assignments for bus stop ${busStopId}`,
      };
    }
  }

  // Fee Type methods
  async getAllFeeTypes() {
    try {
      const types = await this.repository.findAllTypes();
      return {
        success: true,
        data: types,
      };
    } catch (error) {
      console.error('Error in FeeService.getAllFeeTypes:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch fee types',
      };
    }
  }

  async getFeeTypeById(id) {
    try {
      const type = await this.repository.findTypeById(id);
      return {
        success: true,
        data: type,
      };
    } catch (error) {
      console.error('Error in FeeService.getFeeTypeById:', error);
      return {
        success: false,
        error: error.message || `Failed to fetch fee type with id ${id}`,
      };
    }
  }

  // Payment related
  async getStudentFeeStatus(studentId) {
    try {
      const status = await this.repository.getStudentFeeStatus(studentId);
      return {
        success: true,
        data: status,
      };
    } catch (error) {
      console.error('Error in FeeService.getStudentFeeStatus:', error);
      return {
        success: false,
        error: error.message || `Failed to get fee status for student ${studentId}`,
      };
    }
  }

  async getClassFeeCollection(classId) {
    try {
      const collection = await this.repository.getClassFeeCollection(classId);
      return {
        success: true,
        data: collection,
      };
    } catch (error) {
      console.error('Error in FeeService.getClassFeeCollection:', error);
      return {
        success: false,
        error: error.message || `Failed to get fee collection for class ${classId}`,
      };
    }
  }

  async applyFeeToStudents(feeAssignmentId, studentIds) {
    try {
      const result = await this.repository.applyFeeToStudents(feeAssignmentId, studentIds);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error in FeeService.applyFeeToStudents:', error);
      return {
        success: false,
        error: error.message || 'Failed to apply fee to students',
      };
    }
  }

  async exemptStudentFromFee(feeAssignmentId, studentId, reason) {
    try {
      const result = await this.repository.exemptStudentFromFee(feeAssignmentId, studentId, reason);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error in FeeService.exemptStudentFromFee:', error);
      return {
        success: false,
        error: error.message || `Failed to exempt student ${studentId} from fee`,
      };
    }
  }
}