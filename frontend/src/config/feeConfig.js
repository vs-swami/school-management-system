/**
 * Fee Configuration
 * Maps entity types to their allowed fee type names
 * This configuration determines which fee types are available for each entity
 *
 * To update allowed fee types, modify the allowedFeeTypes arrays below
 */

export const ENTITY_FEE_CONFIG = {
  class: {
    allowedFeeTypes: ['Tuition', 'Class', 'Hostel']
  },
  busStop: {
    allowedFeeTypes: ['Transport']
  },
  student: {
    // Students can have all fee types
    allowedFeeTypes: ['Tuition', 'Class', 'Transport', 'Miscellaneous']
  }
};

// Export helper function to get config for an entity type
export const getEntityFeeConfig = (entityType) => {
  return ENTITY_FEE_CONFIG[entityType] || {
    allowedFeeTypes: []
  };
};