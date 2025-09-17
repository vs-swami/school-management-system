'use strict';

/**
 * class-threshold service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::class-threshold.class-threshold', ({ strapi }) => ({
  
  // Get available capacity for a specific class division
  async getAvailableCapacity(classId, divisionId) {
    try {
      const threshold = await strapi.entityService.findMany('api::class-threshold.class-threshold', {
        filters: {
          class: classId,
          division: divisionId
        }
      });

      if (threshold.length === 0) {
        return null; // No threshold defined
      }

      // Count current enrollments in this class division
      const currentEnrollments = await strapi.entityService.count('api::enrollment.enrollment', {
        filters: {
          class: classId,
          administration: { // Filter through administration
            division: divisionId
          }
        }
      });

      return {
        maxCapacity: threshold[0].threshold_number,
        currentEnrollments,
        availableSpots: threshold[0].threshold_number - currentEnrollments,
        isFull: currentEnrollments >= threshold[0].threshold_number
      };
    } catch (error) {
      throw new Error(`Error calculating available capacity: ${error.message}`);
    }
  },

  // Check if a class division can accommodate new students
  async canAccommodateStudents(classId, divisionId, numberOfStudents = 1) {
    try {
      const capacity = await this.getAvailableCapacity(classId, divisionId);
      
      if (!capacity) {
        return { canAccommodate: false, reason: 'No threshold defined for this division' };
      }

      if (capacity.availableSpots >= numberOfStudents) {
        return { canAccommodate: true, availableSpots: capacity.availableSpots };
      } else {
        return { 
          canAccommodate: false, 
          reason: `Not enough capacity. Available: ${capacity.availableSpots}, Requested: ${numberOfStudents}`,
          availableSpots: capacity.availableSpots
        };
      }
    } catch (error) {
      throw new Error(`Error checking accommodation: ${error.message}`);
    }
  },

  // Get class utilization statistics
  async getClassUtilization(classId) {
    try {
      const thresholds = await strapi.entityService.findMany('api::class-threshold.class-threshold', {
        filters: { class: classId },
        populate: { 
          class: true,
          division: true
        }
      });

      if (thresholds.length === 0) {
        return null;
      }
      const utilizationData = [];
      let totalCapacity = 0;
      let totalEnrolled = 0;

      for (const threshold of thresholds) {
        const enrollmentCount = await strapi.entityService.count('api::enrollment.enrollment', {
          filters: {
            class: classId,
            administration: { // Filter through administration
              division: threshold.division.id
            }
          }
        });

        const utilizationPercent = (enrollmentCount / threshold.threshold_number * 100).toFixed(2);
        
        utilizationData.push({
          division: {
            id: threshold.division.id,
            name: threshold.division.name
          },
          capacity: threshold.threshold_number,
          enrolled: enrollmentCount,
          available: threshold.threshold_number - enrollmentCount,
          utilizationPercent: parseFloat(utilizationPercent)
        });

        totalCapacity += threshold.threshold_number;
        totalEnrolled += enrollmentCount;
      }

      return {
        class: thresholds[0].class,
        divisions: utilizationData,
        summary: {
          totalCapacity,
          totalEnrolled,
          totalAvailable: totalCapacity - totalEnrolled,
          overallUtilization: parseFloat((totalEnrolled / totalCapacity * 100).toFixed(2))
        }
      };
    } catch (error) {
      throw new Error(`Error calculating utilization: ${error.message}`);
    }
  },

  // Find best available division for new enrollment
  async findBestAvailableDivision(classId) {
    try {
      const thresholds = await strapi.entityService.findMany('api::class-threshold.class-threshold', {
        filters: { class: classId },
        populate: { division: true }
      });

      const divisionsWithCapacity = [];

      for (const threshold of thresholds) {
        const capacity = await this.getAvailableCapacity(classId, threshold.division.id);
        if (capacity && capacity.availableSpots > 0) {
          divisionsWithCapacity.push({
            division: {
              id: threshold.division.id,
              name: threshold.division.name
            },
            availableSpots: capacity.availableSpots,
            utilizationPercent: (capacity.currentEnrollments / capacity.maxCapacity) * 100
          });
        }
      }

      if (divisionsWithCapacity.length === 0) {
        return null; // No available divisions
      }

      // Sort by lowest utilization (most balanced distribution)
      divisionsWithCapacity.sort((a, b) => a.utilizationPercent - b.utilizationPercent);
      
      return divisionsWithCapacity[0];
    } catch (error) {
      throw new Error(`Error finding best available division: ${error.message}`);
    }
  },

  // Validate threshold creation
  async validateThreshold(classId, divisionId, thresholdNumber) {
    try {
      // Check if threshold already exists
      const existing = await strapi.entityService.findMany('api::class-threshold.class-threshold', {
        filters: {
          class: classId,
          division: divisionId
        }
      });

      if (existing.length > 0) {
        return { valid: false, reason: 'Threshold already exists for this class-division combination' };
      }

      // Check if class exists
      const classExists = await strapi.entityService.findOne('api::class.class', classId);
      if (!classExists) {
        return { valid: false, reason: 'Class does not exist' };
      }

      // Check if division exists
      const divisionExists = await strapi.entityService.findOne('api::division.division', divisionId);
      if (!divisionExists) {
        return { valid: false, reason: 'Division does not exist' };
      }

      // Validate threshold number
      if (thresholdNumber < 1 || thresholdNumber > 100) {
        return { valid: false, reason: 'Threshold number must be between 1 and 100' };
      }

      return { valid: true };
    } catch (error) {
      throw new Error(`Error validating threshold: ${error.message}`);
    }
  },

  // Get threshold by class and division
  async getThresholdByClassAndDivision(classId, divisionId) {
    try {
      const threshold = await strapi.entityService.findMany('api::class-threshold.class-threshold', {
        filters: {
          class: classId,
          division: divisionId
        },
        populate: {
          class: true,
          division: true
        }
      });

      return threshold.length > 0 ? threshold[0] : null;
    } catch (error) {
      throw new Error(`Error getting threshold: ${error.message}`);
    }
  },

  // Update threshold capacity
  async updateThresholdCapacity(classId, divisionId, newCapacity) {
    try {
      const threshold = await this.getThresholdByClassAndDivision(classId, divisionId);
      
      if (!threshold) {
        throw new Error('Threshold not found');
      }

      // Check if reducing capacity would cause issues
      if (newCapacity < threshold.threshold_number) {
        const currentEnrollments = await strapi.entityService.count('api::enrollment.enrollment', {
          filters: {
            class: classId,
            administration: { // Filter through administration
              division: divisionId
            }
          }
        });

        if (currentEnrollments > newCapacity) {
          return {
            success: false,
            reason: `Cannot reduce capacity to ${newCapacity}. Current enrollments: ${currentEnrollments}`
          };
        }
      }

      const updatedThreshold = await strapi.entityService.update(
        'api::class-threshold.class-threshold',
        threshold.id,
        {
          data: { threshold_number: newCapacity },
          populate: {
            class: true,
            division: true
          }
        }
      );

      return { success: true, threshold: updatedThreshold };
    } catch (error) {
      throw new Error(`Error updating threshold capacity: ${error.message}`);
    }
  }
}));